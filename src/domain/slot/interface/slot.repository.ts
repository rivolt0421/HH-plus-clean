import { Slot } from '../slot';

export const slotRepoToken = Symbol('SlotRepo');

export interface SlotRepo {
  getAllSlots(): Promise<Slot[]>;
  getById(slotId: number): Promise<Slot | null>;
  save(slot: Slot): Promise<Slot>;
}
