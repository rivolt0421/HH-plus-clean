import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      name: '홍길동',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: '김철수',
    },
  });

  // 슬롯 생성
  const slot1 = await prisma.slot.create({
    data: {
      title: 'JavaScript 기초',
      speaker_name: '김구루',
      remaining_seats: 20,
      capacity: 20,
    },
  });

  const slot2 = await prisma.slot.create({
    data: {
      title: 'TypeScript 심화',
      speaker_name: '밥아저씨',
      remaining_seats: 15,
      capacity: 15,
    },
  });

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
