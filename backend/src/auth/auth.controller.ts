import { Controller, Post, Get, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
