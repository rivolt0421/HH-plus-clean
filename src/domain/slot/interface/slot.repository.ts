import { Transaction } from 'src/database/prisma.service';
import { Slot } from '../slot';

export const slotRepoToken = Symbol('SlotRepo');

export interface SlotRepo {
  getAllSlots(tx?: Transaction): Promise<Slot[]>;
  getById(slotId: number, tx?: Transaction): Promise<Slot | null>;
  save(slot: Slot, tx?: Transaction): Promise<Slot>;
  decreaseSafely(slotId: number, tx?: Transaction): Promise<Slot>;
}
