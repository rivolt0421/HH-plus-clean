import { Module } from '@nestjs/common';
import { SlotRepoImpl } from 'src/infrastructure/persistence/slot/slot.repository.impl';
import { SlotService } from './slot.service';
import { slotRepoToken } from './interface/slot.repository';

@Module({
  providers: [SlotService, { provide: slotRepoToken, useClass: SlotRepoImpl }],
})
export class SlotModule {}
