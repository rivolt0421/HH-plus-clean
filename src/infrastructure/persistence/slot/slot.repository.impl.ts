import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { SlotRepo } from 'src/domain/slot/interface/slot.repository';
import { Slot } from 'src/domain/slot/slot';

@Injectable()
export class SlotRepoImpl implements SlotRepo {
  constructor(private readonly prisma: PrismaService) {}
  async getAllSlots(): Promise<Slot[]> {
    return this.prisma.slot.findMany().then((result) => {
      return result.map(
        (s) => new Slot(s.id, s.remaining_seats, s.title, s.speaker_name),
      );
    });
  }

  async getById(slotId: number): Promise<Slot | null> {
    return this.prisma.slot
      .findUnique({ where: { id: slotId } })
      .then((s) => new Slot(s.id, s.remaining_seats, s.title, s.speaker_name));
  }

  async save(slot: Slot): Promise<Slot> {
    return this.prisma.slot
      .update({
        where: { id: slot.id },
        data: {
          title: slot.title,
          speaker_name: slot.speakerName,
          remaining_seats: slot.remainingSeats,
        },
      })
      .then((s) => new Slot(s.id, s.remaining_seats, s.title, s.speaker_name));
  }
}
