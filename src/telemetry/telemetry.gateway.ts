import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to your frontend domain
  },
})
export class TelemetryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track connected clients by device_id
  private clients: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Listen for register event — clients identify which device they care about
    client.on('register', (data: { device_id: string }) => {
      const deviceId = data.device_id;
      if (!this.clients.has(deviceId)) {
        this.clients.set(deviceId, new Set());
      }
      this.clients.get(deviceId)!.add(client.id);

      // Join a Socket.IO room for this device
      client.join(`device:${deviceId}`);
      console.log(`Client ${client.id} registered for device ${deviceId}`);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove from all device tracking
    for (const [deviceId, clientSet] of this.clients.entries()) {
      clientSet.delete(client.id);
      if (clientSet.size === 0) {
        this.clients.delete(deviceId);
      }
    }
  }

  /**
   * Broadcast telemetry to all Socket.IO clients watching a device.
   * Called by TelemetryController when ESP32 POSTs data.
   */
  broadcastTelemetry(deviceId: string, data: any) {
    this.server.to(`device:${deviceId}`).emit('telemetry', {
      type: 'telemetry',
      data,
    });
    console.log(`📡 Broadcast telemetry for ${deviceId} to room`);
  }

  /**
   * Broadcast a command event (useful if React wants to see command confirmations).
   */
  broadcastCommand(deviceId: string, command: any) {
    this.server.to(`device:${deviceId}`).emit('command', {
      type: 'command',
      data: command,
    });
  }
}
