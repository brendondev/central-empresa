import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { LoginDto, CreateUserDto, UpdateUserDto, ChangePasswordDto, CreateRoleDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    
    const user = await this.userRepository.findOne({
      where: { username, isActive: true },
      relations: ['role'],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role.name,
      level: user.role.level 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    };
  }

  async createUser(createUserDto: CreateUserDto, createdByUserId: number) {
    const { username, password, email, fullName, roleId } = createUserDto;

    // Verificar se o usuário que está criando tem permissão
    const creatorUser = await this.userRepository.findOne({
      where: { id: createdByUserId },
      relations: ['role'],
    });

    if (!creatorUser || creatorUser.role.level > 1) {
      throw new UnauthorizedException('Sem permissão para criar usuários');
    }

    // Verificar se username já existe
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('Username já existe');
    }

    // Verificar se role existe
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Cargo não encontrado');
    }

    // Verificar se pode criar usuário com esse nível de cargo
    if (creatorUser.role.level >= role.level && creatorUser.role.level !== 0) {
      throw new UnauthorizedException('Não é possível criar usuário com cargo igual ou superior');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      roleId,
    });

    const savedUser = await this.userRepository.save(user);
    
    return this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto, updatedByUserId: number) {
    const updaterUser = await this.userRepository.findOne({
      where: { id: updatedByUserId },
      relations: ['role'],
    });

    if (!updaterUser || updaterUser.role.level > 1) {
      throw new UnauthorizedException('Sem permissão para atualizar usuários');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se pode atualizar usuário deste nível
    if (updaterUser.role.level >= user.role.level && updaterUser.role.level !== 0 && updaterUser.id !== user.id) {
      throw new UnauthorizedException('Não é possível atualizar usuário com cargo igual ou superior');
    }

    // Se está mudando username, verificar se já existe
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({ 
        where: { username: updateUserDto.username } 
      });
      if (existingUser) {
        throw new ConflictException('Username já existe');
      }
    }

    // Se está mudando role, verificar permissões
    if (updateUserDto.roleId && updateUserDto.roleId !== user.roleId) {
      const newRole = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
      if (!newRole) {
        throw new NotFoundException('Cargo não encontrado');
      }
      
      if (updaterUser.role.level >= newRole.level && updaterUser.role.level !== 0) {
        throw new UnauthorizedException('Não é possível definir cargo igual ou superior');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new BadRequestException('Senha atual incorreta');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }

  async getUsers(requestUserId: number) {
    const requestUser = await this.userRepository.findOne({
      where: { id: requestUserId },
      relations: ['role'],
    });

    if (!requestUser || requestUser.role.level > 1) {
      throw new UnauthorizedException('Sem permissão para listar usuários');
    }

    return this.userRepository.find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(id: number, requestUserId: number) {
    const requestUser = await this.userRepository.findOne({
      where: { id: requestUserId },
      relations: ['role'],
    });

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Usuário pode ver seus próprios dados ou admins podem ver todos
    if (requestUser.id !== user.id && requestUser.role.level > 1) {
      throw new UnauthorizedException('Sem permissão para ver este usuário');
    }

    return user;
  }

  async deactivateUser(id: number, deactivatedByUserId: number) {
    const deactivatorUser = await this.userRepository.findOne({
      where: { id: deactivatedByUserId },
      relations: ['role'],
    });

    if (!deactivatorUser || deactivatorUser.role.level > 1) {
      throw new UnauthorizedException('Sem permissão para desativar usuários');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (deactivatorUser.role.level >= user.role.level && deactivatorUser.role.level !== 0) {
      throw new UnauthorizedException('Não é possível desativar usuário com cargo igual ou superior');
    }

    user.isActive = false;
    await this.userRepository.save(user);

    return { message: 'Usuário desativado com sucesso' };
  }

  // Métodos para gerenciar roles
  async createRole(createRoleDto: CreateRoleDto, createdByUserId: number) {
    const creatorUser = await this.userRepository.findOne({
      where: { id: createdByUserId },
      relations: ['role'],
    });

    if (!creatorUser || creatorUser.role.level !== 0) {
      throw new UnauthorizedException('Apenas o administrador master pode criar cargos');
    }

    const existingRole = await this.roleRepository.findOne({ 
      where: { name: createRoleDto.name } 
    });
    
    if (existingRole) {
      throw new ConflictException('Cargo com este nome já existe');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async getRoles(requestUserId: number) {
    const requestUser = await this.userRepository.findOne({
      where: { id: requestUserId },
      relations: ['role'],
    });

    if (!requestUser || requestUser.role.level > 1) {
      throw new UnauthorizedException('Sem permissão para listar cargos');
    }

    return this.roleRepository.find({
      order: { level: 'ASC' },
    });
  }

  async validateUser(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
      relations: ['role'],
    });
    return user;
  }
}
