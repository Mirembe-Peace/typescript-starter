import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { UpdateTelemetryDto } from './dto/update-telemetry.dto';

@WebSocketGateway()
export class TelemetryGateway {
  constructor(private readonly telemetryService: TelemetryService) {}

  @SubscribeMessage('createTelemetry')
  create(@MessageBody() createTelemetryDto: CreateTelemetryDto) {
    return this.telemetryService.create(createTelemetryDto);
  }

  @SubscribeMessage('findAllTelemetry')
  findAll() {
    return this.telemetryService.findAll();
  }

  @SubscribeMessage('findOneTelemetry')
  findOne(@MessageBody() id: number) {
    return this.telemetryService.findOne(id);
  }

  @SubscribeMessage('updateTelemetry')
  update(@MessageBody() updateTelemetryDto: UpdateTelemetryDto) {
    return this.telemetryService.update(updateTelemetryDto.id, updateTelemetryDto);
  }

  @SubscribeMessage('removeTelemetry')
  remove(@MessageBody() id: number) {
    return this.telemetryService.remove(id);
  }
}
