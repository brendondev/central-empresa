import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import makeWASocket, { 
  ConnectionState, 
  DisconnectReason, 
  useMultiFileAuthState,
  downloadMediaMessage,
  proto,
  WAMessage,
  WASocket
} from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import { WhatsAppConnection, WhatsAppStatus } from '../entities/whatsapp-connection.entity';
import { Contact } from '../entities/contact.entity';
import { Message, MessageType, MessageDirection, MessageStatus } from '../entities/message.entity';
import { Tag } from '../entities/tag.entity';
import { Automation } from '../entities/automation.entity';
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

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private clients: Map<string, WASocket> = new Map();
  private qrCodes: Map<string, string> = new Map();

  constructor(
    @InjectRepository(WhatsAppConnection)
    private whatsappConnectionRepository: Repository<WhatsAppConnection>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Automation)
    private automationRepository: Repository<Automation>,
  ) {
    // Criar diretório de sessões se não existir
    const sessionsDir = path.join(process.cwd(), 'whatsapp-sessions');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
  }

  // =================== CONEXÕES WHATSAPP ===================

  async createConnection(userId: number, createDto: CreateWhatsAppConnectionDto): Promise<WhatsAppConnection> {
    // Verificar se já existe uma conexão com este sessionId
    const existingConnection = await this.whatsappConnectionRepository.findOne({
      where: { sessionId: createDto.sessionId }
    });

    if (existingConnection) {
      throw new BadRequestException('Já existe uma conexão com este ID de sessão');
    }

    const connection = this.whatsappConnectionRepository.create({
      ...createDto,
      userId,
      status: WhatsAppStatus.DISCONNECTED
    });

    return await this.whatsappConnectionRepository.save(connection);
  }

  async getConnections(userId: number): Promise<WhatsAppConnection[]> {
    return await this.whatsappConnectionRepository.find({
      where: { userId },
      relations: ['contacts', 'messages'],
      order: { createdAt: 'DESC' }
    });
  }

  async getConnection(userId: number, connectionId: number): Promise<WhatsAppConnection> {
    const connection = await this.whatsappConnectionRepository.findOne({
      where: { id: connectionId, userId },
      relations: ['contacts', 'messages']
    });

    if (!connection) {
      throw new NotFoundException('Conexão WhatsApp não encontrada');
    }

    return connection;
  }

  async updateConnection(userId: number, connectionId: number, updateDto: UpdateWhatsAppConnectionDto): Promise<WhatsAppConnection> {
    const connection = await this.getConnection(userId, connectionId);
    
    Object.assign(connection, updateDto);
    return await this.whatsappConnectionRepository.save(connection);
  }

  async deleteConnection(userId: number, connectionId: number): Promise<void> {
    const connection = await this.getConnection(userId, connectionId);
    
    // Desconectar o cliente se estiver conectado
    await this.disconnectWhatsApp(connection.sessionId);
    
    // Remover arquivos de sessão
    const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', connection.sessionId);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
    
    await this.whatsappConnectionRepository.remove(connection);
  }

  async connectWhatsApp(sessionId: string): Promise<{ qrCode?: string; status: WhatsAppStatus }> {
    const connection = await this.whatsappConnectionRepository.findOne({
      where: { sessionId }
    });

    if (!connection) {
      throw new NotFoundException('Conexão não encontrada');
    }

    // Verificar se já está conectado
    if (this.clients.has(sessionId)) {
      return { status: WhatsAppStatus.CONNECTED };
    }

    try {
      const sessionPath = path.join(process.cwd(), 'whatsapp-sessions', sessionId);
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      const socket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: this.logger as any,
        browser: ['Central Empresa', 'Chrome', '1.0.0'],
      });

      this.clients.set(sessionId, socket);

      return new Promise((resolve) => {
        socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
          const { connection: conn, lastDisconnect, qr } = update;
          
          if (qr) {
            const qrCodeDataURL = await QRCode.toDataURL(qr);
            this.qrCodes.set(sessionId, qrCodeDataURL);
            connection.qrCode = qrCodeDataURL;
            connection.status = WhatsAppStatus.QR_PENDING;
            await this.whatsappConnectionRepository.save(connection);
            resolve({ qrCode: qrCodeDataURL, status: WhatsAppStatus.QR_PENDING });
          }

          if (conn === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
              connection.status = WhatsAppStatus.CONNECTING;
              await this.whatsappConnectionRepository.save(connection);
              this.connectWhatsApp(sessionId);
            } else {
              connection.status = WhatsAppStatus.DISCONNECTED;
              connection.qrCode = null;
              await this.whatsappConnectionRepository.save(connection);
              this.clients.delete(sessionId);
            }
          } else if (conn === 'open') {
            connection.status = WhatsAppStatus.CONNECTED;
            connection.qrCode = null;
            connection.lastSeen = new Date();
            
            // Obter informações do perfil
            const profile = await socket.user;
            if (profile) {
              connection.phoneNumber = profile.id.split(':')[0];
              connection.profileName = profile.name || profile.verifiedName;
            }
            
            await this.whatsappConnectionRepository.save(connection);
            resolve({ status: WhatsAppStatus.CONNECTED });
          } else if (conn === 'connecting') {
            connection.status = WhatsAppStatus.CONNECTING;
            await this.whatsappConnectionRepository.save(connection);
          }
        });

        socket.ev.on('creds.update', saveCreds);
        
        socket.ev.on('messages.upsert', async (m) => {
          await this.handleIncomingMessages(m.messages, connection);
        });
      });

    } catch (error) {
      this.logger.error(`Erro ao conectar WhatsApp ${sessionId}:`, error);
      connection.status = WhatsAppStatus.ERROR;
      await this.whatsappConnectionRepository.save(connection);
      throw error;
    }
  }

  async disconnectWhatsApp(sessionId: string): Promise<void> {
    const client = this.clients.get(sessionId);
    if (client) {
      try {
        await client.logout();
      } catch (error) {
        this.logger.error(`Erro ao desconectar WhatsApp ${sessionId}:`, error);
      }
      this.clients.delete(sessionId);
    }

    this.qrCodes.delete(sessionId);

    const connection = await this.whatsappConnectionRepository.findOne({
      where: { sessionId }
    });

    if (connection) {
      connection.status = WhatsAppStatus.DISCONNECTED;
      connection.qrCode = null;
      await this.whatsappConnectionRepository.save(connection);
    }
  }

  private async handleIncomingMessages(messages: WAMessage[], connection: WhatsAppConnection): Promise<void> {
    for (const message of messages) {
      if (message.key.fromMe) continue; // Ignorar mensagens próprias

      try {
        const phoneNumber = message.key.remoteJid?.replace('@s.whatsapp.net', '').replace('@c.us', '');
        if (!phoneNumber) continue;

        // Buscar ou criar contato
        let contact = await this.contactRepository.findOne({
          where: { phoneNumber, whatsappConnectionId: connection.id }
        });

        if (!contact) {
          const pushName = message.pushName || 'Contato';
          contact = this.contactRepository.create({
            phoneNumber,
            name: pushName,
            whatsappConnectionId: connection.id
          });
          await this.contactRepository.save(contact);
        }

        // Salvar mensagem
        const content = message.message?.conversation || 
                       message.message?.extendedTextMessage?.text || 
                       message.message?.imageMessage?.caption ||
                       message.message?.videoMessage?.caption ||
                       '[Mídia]';

        const messageEntity = this.messageRepository.create({
          whatsappMessageId: message.key.id,
          type: this.getMessageType(message),
          direction: MessageDirection.INCOMING,
          status: MessageStatus.DELIVERED,
          content,
          timestamp: new Date((message.messageTimestamp as number) * 1000),
          whatsappConnectionId: connection.id,
          contactId: contact.id
        });

        await this.messageRepository.save(messageEntity);

        // Atualizar último contato
        contact.lastMessage = new Date();
        await this.contactRepository.save(contact);

        this.logger.log(`Nova mensagem de ${phoneNumber}: ${content}`);

      } catch (error) {
        this.logger.error('Erro ao processar mensagem:', error);
      }
    }
  }

  private getMessageType(message: WAMessage): MessageType {
    if (message.message?.imageMessage) return MessageType.IMAGE;
    if (message.message?.audioMessage) return MessageType.AUDIO;
    if (message.message?.videoMessage) return MessageType.VIDEO;
    if (message.message?.documentMessage) return MessageType.DOCUMENT;
    if (message.message?.stickerMessage) return MessageType.STICKER;
    if (message.message?.locationMessage) return MessageType.LOCATION;
    if (message.message?.contactMessage) return MessageType.CONTACT_CARD;
    return MessageType.TEXT;
  }

  // =================== CONTATOS ===================

  async createContact(connectionId: number, createDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createDto,
      whatsappConnectionId: connectionId
    });

    const savedContact = await this.contactRepository.save(contact);

    // Adicionar tags se fornecidas
    if (createDto.tagIds && createDto.tagIds.length > 0) {
      const tags = await this.tagRepository.findByIds(createDto.tagIds);
      savedContact.tags = tags;
      await this.contactRepository.save(savedContact);
    }

    return savedContact;
  }

  async getContacts(connectionId: number): Promise<Contact[]> {
    return await this.contactRepository.find({
      where: { whatsappConnectionId: connectionId },
      relations: ['tags', 'messages'],
      order: { lastMessage: 'DESC' }
    });
  }

  async updateContact(contactId: number, updateDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
      relations: ['tags']
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    Object.assign(contact, updateDto);

    // Atualizar tags se fornecidas
    if (updateDto.tagIds !== undefined) {
      if (updateDto.tagIds.length > 0) {
        const tags = await this.tagRepository.findByIds(updateDto.tagIds);
        contact.tags = tags;
      } else {
        contact.tags = [];
      }
    }

    return await this.contactRepository.save(contact);
  }

  async deleteContact(contactId: number): Promise<void> {
    const contact = await this.contactRepository.findOne({ where: { id: contactId } });
    
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    await this.contactRepository.remove(contact);
  }

  // =================== TAGS ===================

  async createTag(connectionId: number, createDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create({
      ...createDto,
      whatsappConnectionId: connectionId
    });

    return await this.tagRepository.save(tag);
  }

  async getTags(connectionId: number): Promise<Tag[]> {
    return await this.tagRepository.find({
      where: { whatsappConnectionId: connectionId, isActive: true },
      relations: ['contacts'],
      order: { name: 'ASC' }
    });
  }

  async updateTag(tagId: number, updateDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    
    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    Object.assign(tag, updateDto);
    return await this.tagRepository.save(tag);
  }

  async deleteTag(tagId: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id: tagId } });
    
    if (!tag) {
      throw new NotFoundException('Tag não encontrada');
    }

    await this.tagRepository.remove(tag);
  }

  // =================== MENSAGENS ===================

  async sendMessage(connectionId: number, sendDto: SendMessageDto): Promise<Message> {
    const connection = await this.whatsappConnectionRepository.findOne({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new NotFoundException('Conexão não encontrada');
    }

    const client = this.clients.get(connection.sessionId);
    if (!client) {
      throw new BadRequestException('WhatsApp não está conectado');
    }

    const contact = await this.contactRepository.findOne({
      where: { id: sendDto.contactId }
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    const jid = `${contact.phoneNumber}@s.whatsapp.net`;

    try {
      let sentMessage;
      if (sendDto.type === MessageType.TEXT) {
        sentMessage = await client.sendMessage(jid, { text: sendDto.content });
      } else if (sendDto.mediaUrl) {
        // Para mídia, você precisará implementar o upload e conversão
        // Por enquanto, vamos apenas enviar como texto
        sentMessage = await client.sendMessage(jid, { text: sendDto.content || 'Mídia enviada' });
      }

      // Salvar mensagem no banco
      const messageEntity = this.messageRepository.create({
        whatsappMessageId: sentMessage.key.id,
        type: sendDto.type,
        direction: MessageDirection.OUTGOING,
        status: MessageStatus.SENT,
        content: sendDto.content,
        mediaUrl: sendDto.mediaUrl,
        timestamp: new Date(),
        whatsappConnectionId: connectionId,
        contactId: sendDto.contactId
      });

      return await this.messageRepository.save(messageEntity);

    } catch (error) {
      this.logger.error('Erro ao enviar mensagem:', error);
      throw new BadRequestException('Erro ao enviar mensagem');
    }
  }

  async getMessages(connectionId: number, contactId?: number): Promise<Message[]> {
    const where: any = { whatsappConnectionId: connectionId };
    if (contactId) {
      where.contactId = contactId;
    }

    return await this.messageRepository.find({
      where,
      relations: ['contact'],
      order: { timestamp: 'DESC' },
      take: 100
    });
  }

  // =================== AUTOMAÇÕES ===================

  async createAutomation(connectionId: number, createDto: CreateAutomationDto): Promise<Automation> {
    const automation = this.automationRepository.create({
      ...createDto,
      whatsappConnectionId: connectionId
    });

    return await this.automationRepository.save(automation);
  }

  async getAutomations(connectionId: number): Promise<Automation[]> {
    return await this.automationRepository.find({
      where: { whatsappConnectionId: connectionId },
      order: { createdAt: 'DESC' }
    });
  }

  async updateAutomation(automationId: number, updateDto: UpdateAutomationDto): Promise<Automation> {
    const automation = await this.automationRepository.findOne({
      where: { id: automationId }
    });

    if (!automation) {
      throw new NotFoundException('Automação não encontrada');
    }

    Object.assign(automation, updateDto);
    return await this.automationRepository.save(automation);
  }

  async deleteAutomation(automationId: number): Promise<void> {
    const automation = await this.automationRepository.findOne({
      where: { id: automationId }
    });

    if (!automation) {
      throw new NotFoundException('Automação não encontrada');
    }

    await this.automationRepository.remove(automation);
  }
}
