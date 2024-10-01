import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService, Transaction } from 'src/database/prisma.service';
import { SlotRepo } from 'src/domain/slot/interface/slot.repository';
import { Slot } from 'src/domain/slot/slot';

@Injectable()
export class SlotRepoImpl implements SlotRepo {
  constructor(private readonly prisma: PrismaService) {}
  async getAllSlots(tx?: Transaction): Promise<Slot[]> {
    return (tx ?? this.prisma).slot.findMany().then((result) => {
      return result.map(
        (s) => new Slot(s.id, s.remaining_seats, s.title, s.speaker_name),
      );
    });
  }

  async getById(slotId: number, tx?: Transaction): Promise<Slot | null> {
    return (tx ?? this.prisma).slot
      .findUnique({ where: { id: slotId } })
      .then((s) => new Slot(s.id, s.remaining_seats, s.title, s.speaker_name));
  }

  async save(slot: Slot, tx?: Transaction): Promise<Slot> {
    return (tx ?? this.prisma).slot
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

  async decreaseSafely(slotId: number, tx?: Transaction): Promise<Slot | null> {
    return (tx ?? this.prisma).slot
      .update({
        where: { id: slotId, remaining_seats: { gt: 0 } },
        data: {
          remaining_seats: { decrement: 1 },
        },
      })
      .then((s) => new Slot(s.id, s.remaining_seats, s.title, s.speaker_name))
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === this.prisma.errorCode.RECORD_NOT_FOUND) {
            return null;
          }
        }
        throw error;
      });
  }
}
