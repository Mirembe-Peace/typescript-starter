import { Injectable } from '@nestjs/common';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { CreateCommandDto } from './dto/create-command.dto';

export interface TelemetryRecord extends CreateTelemetryDto {
  received_at: string;
}

export interface CommandRecord extends CreateCommandDto {
  id: string;
  created_at: string;
}

@Injectable()
export class TelemetryService {
  // In-memory store — replace with database later
  private telemetryStore: Map<string, TelemetryRecord[]> = new Map();
  private pendingCommands: Map<string, CommandRecord[]> = new Map();
  private readonly MAX_RECORDS_PER_DEVICE = 100;

  /**
   * Store telemetry data from ESP32
   */
  create(dto: CreateTelemetryDto): TelemetryRecord {
    const record: TelemetryRecord = {
      ...dto,
      received_at: new Date().toISOString(),
    };

    const deviceId = dto.device_id;
    if (!this.telemetryStore.has(deviceId)) {
      this.telemetryStore.set(deviceId, []);
    }

    const records = this.telemetryStore.get(deviceId)!;
    records.push(record);

    // Keep only the last N records per device
    if (records.length > this.MAX_RECORDS_PER_DEVICE) {
      records.splice(0, records.length - this.MAX_RECORDS_PER_DEVICE);
    }

    return record;
  }

  /**
   * Get recent telemetry for a device
   */
  findRecent(deviceId: string, limit: number = 10): { rows: TelemetryRecord[]; total: number } {
    const records = this.telemetryStore.get(deviceId) || [];
    const recent = records.slice(-limit).reverse(); // Most recent first
    return { rows: recent, total: records.length };
  }

  /**
   * Get the latest single telemetry entry for a device
   */
  findLatest(deviceId: string): TelemetryRecord | null {
    const records = this.telemetryStore.get(deviceId);
    if (!records || records.length === 0) return null;
    return records[records.length - 1];
  }

  /**
   * Store a command for a device (from React frontend)
   */
  addCommand(dto: CreateCommandDto): CommandRecord {
    const record: CommandRecord = {
      ...dto,
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
    };

    const deviceId = dto.device_id;
    if (!this.pendingCommands.has(deviceId)) {
      this.pendingCommands.set(deviceId, []);
    }

    this.pendingCommands.get(deviceId)!.push(record);
    return record;
  }

  /**
   * Get and clear pending commands for a device (ESP32 polls this)
   */
  getPendingCommands(deviceId: string): CommandRecord[] {
    const commands = this.pendingCommands.get(deviceId) || [];
    // Clear after retrieval — each command is delivered once
    this.pendingCommands.set(deviceId, []);
    return commands;
  }
}
