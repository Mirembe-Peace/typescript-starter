export class CreateTelemetryDto {
  device_id: string;
  temperature?: number;
  humidity?: number;
  voltage?: number;
  motion?: number;
  fan_speed?: number;
  fan_rpm?: number;
  timestamp?: number;
}
