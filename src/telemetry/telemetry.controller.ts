import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryGateway } from './telemetry.gateway';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { CreateCommandDto } from './dto/create-command.dto';

@Controller()
export class TelemetryController {
  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly telemetryGateway: TelemetryGateway,
  ) {}

  /**
   * ESP32 POSTs sensor data here every 5 seconds
   * POST /telemetry
   */
  @Post('telemetry')
  receiveTelemetry(@Body() dto: CreateTelemetryDto) {
    const record = this.telemetryService.create(dto);

    // Broadcast to all connected React clients via Socket.IO
    this.telemetryGateway.broadcastTelemetry(dto.device_id, record);

    return { status: 'ok', received_at: record.received_at };
  }

  /**
   * React frontend fetches recent telemetry
   * GET /telemetry/recent?device_id=esp01&limit=10
   */
  @Get('telemetry/recent')
  getRecentTelemetry(
    @Query('device_id') deviceId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.telemetryService.findRecent(deviceId, parsedLimit);
  }

  /**
   * React frontend sends fan/device commands
   * POST /command
   */
  @Post('command')
  sendCommand(@Body() dto: CreateCommandDto) {
    const record = this.telemetryService.addCommand(dto);

    // Also broadcast the command to Socket.IO clients (optional: for UI feedback)
    this.telemetryGateway.broadcastCommand(dto.device_id, record);

    return { status: 'ok', command: record };
  }

  /**
   * ESP32 polls for pending commands
   * GET /command/pending?device_id=esp01
   */
  @Get('command/pending')
  getPendingCommands(@Query('device_id') deviceId: string) {
    const commands = this.telemetryService.getPendingCommands(deviceId);
    return { commands };
  }
}
