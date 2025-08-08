import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsAppService } from './whatsapp.service';
import { 
  CreateWhatsAppConnectionDto, 
  UpdateWhatsAppConnectionDto,
  CreateContactDto,
  UpdateContactDto,
  CreateTagDto,
  UpdateTagDto,
  SendMessageDto,
  CreateAutomationDto,
  UpdateAutomationDto
} from '../dto/whatsapp.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  // =================== CONEXÕES WHATSAPP ===================

  @Post('connections')
  @ApiOperation({ summary: 'Criar nova conexão WhatsApp' })
  @ApiResponse({ status: 201, description: 'Conexão criada com sucesso' })
  async createConnection(@Request() req: any, @Body() createDto: CreateWhatsAppConnectionDto) {
    return this.whatsappService.createConnection(req.user.sub, createDto);
  }

  @Get('connections')
  @ApiOperation({ summary: 'Listar conexões WhatsApp do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de conexões' })
  async getConnections(@Request() req: any) {
    return this.whatsappService.getConnections(req.user.sub);
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Obter detalhes de uma conexão WhatsApp' })
  @ApiResponse({ status: 200, description: 'Detalhes da conexão' })
  async getConnection(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.whatsappService.getConnection(req.user.sub, id);
  }

  @Put('connections/:id')
  @ApiOperation({ summary: 'Atualizar conexão WhatsApp' })
  @ApiResponse({ status: 200, description: 'Conexão atualizada com sucesso' })
  async updateConnection(
    @Request() req: any, 
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWhatsAppConnectionDto
  ) {
    return this.whatsappService.updateConnection(req.user.sub, id, updateDto);
  }

  @Delete('connections/:id')
  @ApiOperation({ summary: 'Remover conexão WhatsApp' })
  @ApiResponse({ status: 200, description: 'Conexão removida com sucesso' })
  async deleteConnection(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.whatsappService.deleteConnection(req.user.sub, id);
    return { message: 'Conexão removida com sucesso' };
  }

  @Post('connections/:sessionId/connect')
  @ApiOperation({ summary: 'Conectar WhatsApp (gerar QR Code)' })
  @ApiResponse({ status: 200, description: 'QR Code gerado ou conexão estabelecida' })
  async connectWhatsApp(@Param('sessionId') sessionId: string) {
    return this.whatsappService.connectWhatsApp(sessionId);
  }

  @Post('connections/:sessionId/disconnect')
  @ApiOperation({ summary: 'Desconectar WhatsApp' })
  @ApiResponse({ status: 200, description: 'WhatsApp desconectado com sucesso' })
  async disconnectWhatsApp(@Param('sessionId') sessionId: string) {
    await this.whatsappService.disconnectWhatsApp(sessionId);
    return { message: 'WhatsApp desconectado com sucesso' };
  }

  // =================== CONTATOS ===================

  @Post('connections/:connectionId/contacts')
  @ApiOperation({ summary: 'Criar novo contato' })
  @ApiResponse({ status: 201, description: 'Contato criado com sucesso' })
  async createContact(
    @Param('connectionId', ParseIntPipe) connectionId: number,
    @Body() createDto: CreateContactDto
  ) {
    return this.whatsappService.createContact(connectionId, createDto);
  }

  @Get('connections/:connectionId/contacts')
  @ApiOperation({ summary: 'Listar contatos de uma conexão' })
  @ApiResponse({ status: 200, description: 'Lista de contatos' })
  async getContacts(@Param('connectionId', ParseIntPipe) connectionId: number) {
    return this.whatsappService.getContacts(connectionId);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Atualizar contato' })
  @ApiResponse({ status: 200, description: 'Contato atualizado com sucesso' })
  async updateContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateContactDto
  ) {
    return this.whatsappService.updateContact(id, updateDto);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Remover contato' })
  @ApiResponse({ status: 200, description: 'Contato removido com sucesso' })
  async deleteContact(@Param('id', ParseIntPipe) id: number) {
    await this.whatsappService.deleteContact(id);
    return { message: 'Contato removido com sucesso' };
  }

  // =================== TAGS ===================

  @Post('connections/:connectionId/tags')
  @ApiOperation({ summary: 'Criar nova tag' })
  @ApiResponse({ status: 201, description: 'Tag criada com sucesso' })
  async createTag(
    @Param('connectionId', ParseIntPipe) connectionId: number,
    @Body() createDto: CreateTagDto
  ) {
    return this.whatsappService.createTag(connectionId, createDto);
  }

  @Get('connections/:connectionId/tags')
  @ApiOperation({ summary: 'Listar tags de uma conexão' })
  @ApiResponse({ status: 200, description: 'Lista de tags' })
  async getTags(@Param('connectionId', ParseIntPipe) connectionId: number) {
    return this.whatsappService.getTags(connectionId);
  }

  @Put('tags/:id')
  @ApiOperation({ summary: 'Atualizar tag' })
  @ApiResponse({ status: 200, description: 'Tag atualizada com sucesso' })
  async updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTagDto
  ) {
    return this.whatsappService.updateTag(id, updateDto);
  }

  @Delete('tags/:id')
  @ApiOperation({ summary: 'Remover tag' })
  @ApiResponse({ status: 200, description: 'Tag removida com sucesso' })
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    await this.whatsappService.deleteTag(id);
    return { message: 'Tag removida com sucesso' };
  }

  // =================== MENSAGENS ===================

  @Post('connections/:connectionId/messages')
  @ApiOperation({ summary: 'Enviar mensagem' })
  @ApiResponse({ status: 201, description: 'Mensagem enviada com sucesso' })
  async sendMessage(
    @Param('connectionId', ParseIntPipe) connectionId: number,
    @Body() sendDto: SendMessageDto
  ) {
    return this.whatsappService.sendMessage(connectionId, sendDto);
  }

  @Get('connections/:connectionId/messages')
  @ApiOperation({ summary: 'Listar mensagens de uma conexão' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens' })
  async getMessages(@Param('connectionId', ParseIntPipe) connectionId: number) {
    return this.whatsappService.getMessages(connectionId);
  }

  @Get('connections/:connectionId/messages/contact/:contactId')
  @ApiOperation({ summary: 'Listar mensagens de um contato específico' })
  @ApiResponse({ status: 200, description: 'Lista de mensagens do contato' })
  async getContactMessages(
    @Param('connectionId', ParseIntPipe) connectionId: number,
    @Param('contactId', ParseIntPipe) contactId: number
  ) {
    return this.whatsappService.getMessages(connectionId, contactId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload de arquivo para mídia' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // TODO: Implementar upload para storage (S3, local, etc.)
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}` // URL temporária
    };
  }

  // =================== AUTOMAÇÕES ===================

  @Post('connections/:connectionId/automations')
  @ApiOperation({ summary: 'Criar nova automação' })
  @ApiResponse({ status: 201, description: 'Automação criada com sucesso' })
  async createAutomation(
    @Param('connectionId', ParseIntPipe) connectionId: number,
    @Body() createDto: CreateAutomationDto
  ) {
    return this.whatsappService.createAutomation(connectionId, createDto);
  }

  @Get('connections/:connectionId/automations')
  @ApiOperation({ summary: 'Listar automações de uma conexão' })
  @ApiResponse({ status: 200, description: 'Lista de automações' })
  async getAutomations(@Param('connectionId', ParseIntPipe) connectionId: number) {
    return this.whatsappService.getAutomations(connectionId);
  }

  @Put('automations/:id')
  @ApiOperation({ summary: 'Atualizar automação' })
  @ApiResponse({ status: 200, description: 'Automação atualizada com sucesso' })
  async updateAutomation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAutomationDto
  ) {
    return this.whatsappService.updateAutomation(id, updateDto);
  }

  @Delete('automations/:id')
  @ApiOperation({ summary: 'Remover automação' })
  @ApiResponse({ status: 200, description: 'Automação removida com sucesso' })
  async deleteAutomation(@Param('id', ParseIntPipe) id: number) {
    await this.whatsappService.deleteAutomation(id);
    return { message: 'Automação removida com sucesso' };
  }
}
