import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export type Transaction = Prisma.TransactionClient;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public readonly errorCode = {
    RECORD_NOT_FOUND: 'P2025',
    UNIQUE_CONSTRAINT_FAILED: 'P2002',
  };

  async onModuleInit() {
    await this.$connect();
  }
}
