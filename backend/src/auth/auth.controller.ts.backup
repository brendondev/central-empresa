import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, CreateUserDto, UpdateUserDto, ChangePasswordDto, CreateRoleDto } from '../dto/auth.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 409, description: 'Username já existe' })
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.authService.createUser(createUserDto, req.user.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getUsers(@Request() req) {
    console.log('AuthController /users - Authorization header:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('AuthController /users - No valid authorization header');
      return { message: 'Token não fornecido', statusCode: 401 };
    }

    const token = authHeader.substring(7);
    console.log('AuthController /users - Token extracted:', token.substring(0, 20) + '...');
    
    try {
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'central-empresa-secret-key-2025';
      const decoded = jwt.verify(token, secret);
      
      console.log('AuthController /users - Token decoded successfully:', decoded);
      const result = await this.authService.getUsers(decoded.sub);
      console.log('AuthController /users - Service result:', result);
      return result;
    } catch (error) {
      console.log('AuthController /users - JWT error:', error.message);
      return { message: 'Token inválido', statusCode: 401 };
    }
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.authService.getUserById(id, req.user.id);
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.authService.updateUser(id, updateUserDto, req.user.id);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar senha do usuário logado' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Senha atual incorreta' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deactivateUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.authService.deactivateUser(id, req.user.id);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  async getMe(@Request() req) {
    const authHeader = req.headers.authorization;
    console.log('AuthController /me - Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { message: 'Token não fornecido', statusCode: 401 };
    }

    const token = authHeader.substring(7);
    
    try {
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'central-empresa-secret-key-2025';
      const decoded = jwt.verify(token, secret);
      
      console.log('AuthController /me - Token decoded:', decoded);
      
      const user = await this.authService.getUserById(decoded.sub, decoded.sub);
      return user;
    } catch (error) {
      console.log('AuthController /me - JWT error:', error.message);
      return { message: 'Token inválido', statusCode: 401 };
    }
  }

  @Get('test-token')
  @ApiOperation({ summary: 'Testar token sem guard' })
  async testToken(@Request() req) {
    console.log('AuthController /test-token - Headers:', req.headers);
    console.log('AuthController /test-token - Authorization:', req.headers.authorization);
    return { message: 'Endpoint de teste sem guard', headers: req.headers };
  }

  // Endpoints para gerenciar roles
  @Post('roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo cargo (apenas master admin)' })
  @ApiResponse({ status: 201, description: 'Cargo criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async createRole(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    return this.authService.createRole(createRoleDto, req.user.id);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar todos os cargos' })
  @ApiResponse({ status: 200, description: 'Lista de cargos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getRoles(@Request() req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { message: 'Token não fornecido', statusCode: 401 };
    }

    const token = authHeader.substring(7);
    
    try {
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'central-empresa-secret-key-2025';
      const decoded = jwt.verify(token, secret);
      
      return this.authService.getRoles(decoded.sub);
    } catch (error) {
      return { message: 'Token inválido', statusCode: 401 };
    }
  }
}
