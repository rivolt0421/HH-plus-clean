import { Injectable } from '@nestjs/common';
import { PrismaService, Transaction } from 'src/database/prisma.service';
import { RegistrationRepo } from 'src/domain/register/interface/registration.repository';
import { Registration } from 'src/domain/register/register';
import { RegistrationExistsError } from 'src/domain/register/register.service';

@Injectable()
export class RegistrationRepoImpl implements RegistrationRepo {
  constructor(private readonly prisma: PrismaService) {}
  async getByUserId(userId: number, tx?: Transaction): Promise<Registration[]> {
    return await (tx ?? this.prisma).registration
      .findMany({
        where: { user_id: userId },
      })
      .then((result) => {
        return result.map((r) => new Registration(r.id, r.user_id, r.slot_id));
      });
  }

  async create(
    registration: Omit<Registration, 'id'>,
    tx?: Transaction,
  ): Promise<Registration> {
    return await (tx ?? this.prisma).registration
      .create({
        data: {
          user_id: registration.userId,
          slot_id: registration.slotId,
        },
      })
      .then((r) => new Registration(r.id, r.user_id, r.slot_id))
      .catch((e) => {
        if (e.code === this.prisma.errorCode.UNIQUE_CONSTRAINT_FAILED) {
          throw new RegistrationExistsError();
        }
        throw e;
      });
  }
}
