import { Inject, Injectable } from '@nestjs/common';
import { SlotRepo, slotRepoToken } from './interface/slot.repository';
import { Slot } from './slot';

@Injectable()
export class SlotService {
  constructor(@Inject(slotRepoToken) private readonly slotRepo: SlotRepo) {}

  async getAvailableSlots(): Promise<Slot[]> {
    const slots = await this.slotRepo.getAllSlots();
    return slots.filter((s) => s.isAvailable());
  }

  async decreaseRemaingSeats(slotId: number): Promise<void> {
    const slot = await this.slotRepo.getById(slotId);

    if (!slot) {
      throw Error('slot이 존재하지 않습니다.');
    }

    const success = slot.decreaseRemainingSeats();

    if (!success) {
      throw Error('slot의 잔여석을 차감할 수 없습니다.');
    }

    await this.slotRepo.save(slot);
  }
}
