import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(JwtAuthGuard)
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Socket[]> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remover o socket dos usuários conectados
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.findIndex(socket => socket.id === client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: number }) {
    const { userId } = payload;
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    
    this.userSockets.get(userId).push(client);
    client.join(`user_${userId}`);
    
    console.log(`User ${userId} joined with socket ${client.id}`);
  }

  // Enviar atualização de status do WhatsApp
  emitWhatsAppStatus(userId: number, sessionId: string, status: string, qrCode?: string) {
    this.server.to(`user_${userId}`).emit('whatsapp_status', {
      sessionId,
      status,
      qrCode,
      timestamp: new Date(),
    });
  }

  // Enviar nova mensagem recebida
  emitNewMessage(userId: number, message: any) {
    this.server.to(`user_${userId}`).emit('new_message', {
      message,
      timestamp: new Date(),
    });
  }

  // Enviar atualização de contato
  emitContactUpdate(userId: number, contact: any) {
    this.server.to(`user_${userId}`).emit('contact_update', {
      contact,
      timestamp: new Date(),
    });
  }

  // Enviar notificação de automação executada
  emitAutomationExecuted(userId: number, automation: any, contact: any) {
    this.server.to(`user_${userId}`).emit('automation_executed', {
      automation,
      contact,
      timestamp: new Date(),
    });
  }
}
