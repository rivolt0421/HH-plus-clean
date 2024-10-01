import { Injectable } from '@nestjs/common';
import { RegisterService } from '../domain/register/register.service';
import { SlotService } from '../domain/slot/slot.service';
import { Slot } from 'src/domain/slot/slot';
import { Registration } from 'src/domain/register/register';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LectureFacade {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly slotService: SlotService,
    private readonly registerService: RegisterService,
  ) {}

  async doRegister(userId: number, slotId: number): Promise<boolean> {
    await this.prismaService.$transaction(async (tx) => {
      await this.slotService.decreaseRemaingSeats(slotId, tx);
    });
    await this.registerService.register(userId, slotId);

    return true;
  }

  async getRegisteredOfUser(userId: number): Promise<
    {
      registration: Registration;
      slot: Slot;
    }[]
  > {
    const registrations = await this.registerService.getOfUser(userId);
    const reulst = await Promise.all(
      registrations.map(async (registration) => {
        const slot = await this.slotService.getById(registration.slotId);
        return { registration, slot };
      }),
    );

    return reulst;
  }

  async getAvailableSlots(): Promise<Slot[]> {
    return await this.slotService.getAvailableSlots();
  }
}
