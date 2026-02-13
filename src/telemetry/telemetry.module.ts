import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryController } from './telemetry.controller';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryGateway, TelemetryService],
})
export class TelemetryModule {}
