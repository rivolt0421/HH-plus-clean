import { Slot } from 'src/domain/slot/slot';

export class SlotDto {
  id: number;
  remainingSeats: number;
  title: string;
  speakerName: string;

  constructor(slot: Slot) {
    this.id = slot.id;
    this.remainingSeats = slot.remainingSeats;
    this.title = slot.title;
    this.speakerName = slot.speakerName;
  }
}
