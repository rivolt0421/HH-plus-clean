import { Inject, Injectable } from '@nestjs/common';
import { SlotRepo, slotRepoToken } from './interface/slot.repository';
import { Slot } from './slot';
import { Transaction } from 'src/database/prisma.service';

@Injectable()
export class SlotService {
  constructor(@Inject(slotRepoToken) private readonly slotRepo: SlotRepo) {}

  async getById(slotId: number): Promise<Slot | null> {
    const slot = await this.slotRepo.getById(slotId);

    if (!slot) {
      throw Error('특강이 존재하지 않습니다.');
    }

    return slot;
  }

  async getAvailableSlots(): Promise<Slot[]> {
    const slots = await this.slotRepo.getAllSlots();
    return slots.filter((s) => s.remainingSeats > 0);
  }

  async decreaseRemaingSeats(slotId: number, tx?: Transaction): Promise<void> {
    const slot = await this.slotRepo.getById(slotId, tx);

    if (!slot) {
      throw Error('특강이 존재하지 않습니다.');
    }

    if (slot.remainingSeats <= 0) {
      throw Error('특강에 남은 좌석이 없습니다.');
    }

    const updatedSlot = await this.slotRepo.decreaseSafely(slotId, tx);

    if (!updatedSlot) {
      throw Error('남은 좌석이 없습니다.');
    }
  }
}
