import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaService } from '../../../database/prisma.service';
import { join } from 'path';
import { execSync } from 'child_process';

describe('LectureController (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;

  beforeAll(async () => {
    // PostgreSQL 컨테이너 시작
    container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    const DATABASE_URL = container.getConnectionUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useFactory({
        factory: () => {
          const prisma = new PrismaService({
            datasources: {
              db: {
                url: DATABASE_URL,
              },
            },
          });
          return prisma;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await setupTestData(prisma, DATABASE_URL);
  }, 10000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await container.stop();
  });

  it('/lecture/available (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/lecture/available')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('remainingSeats');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('speakerName');
    }

    // 데이터베이스 확인
    const _dbSlots = await prisma.slot.findMany({
      where: { remaining_seats: { gt: 0 } },
    });
    const dbSlots = new Map(_dbSlots.map((slot) => [slot.id, slot]));

    expect(response.body.length).toBe(dbSlots.size);
    response.body.forEach((slot) => {
      expect(dbSlots.has(slot.id)).toBe(true);
      expect(dbSlots.get(slot.id).title).toBe(slot.title);
      expect(dbSlots.get(slot.id).remaining_seats).toBe(slot.remainingSeats);
      expect(dbSlots.get(slot.id).speaker_name).toBe(slot.speakerName);
    });
  });

  it('/lecture/registered/:userId (GET)', async () => {
    const userId = 1;
    const response = await request(app.getHttpServer())
      .get(`/lecture/registered/${userId}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('lectureTitle');
      expect(response.body[0]).toHaveProperty('lectureSpeakerName');
    }

    // 데이터베이스 확인
    const _dbRegistrations = await prisma.registration.findMany({
      where: { user_id: userId },
      include: { slot: true },
    });
    const dbRegistrations = new Map(
      _dbRegistrations.map((registration) => [registration.id, registration]),
    );

    expect(response.body.length).toBe(dbRegistrations.size);
    response.body.forEach((registration) => {
      expect(dbRegistrations.has(registration.id)).toBe(true);
      expect(dbRegistrations.get(registration.id).slot.title).toBe(
        registration.lectureTitle,
      );
      expect(dbRegistrations.get(registration.id).slot.speaker_name).toBe(
        registration.lectureSpeakerName,
      );
    });
  });

  it('/lecture/register (POST)', async () => {
    const userId = 2;
    const slotId = 1;

    const initialSlot = await prisma.slot.findUnique({ where: { id: slotId } });
    const initialRegistrations = await prisma.registration.count({
      where: { user_id: userId, slot_id: slotId },
    });

    const response = await request(app.getHttpServer())
      .post('/lecture/register')
      .send({ userId, slotId })
      .expect(201);

    expect(response.text).toBe('true');

    // 데이터베이스 확인
    const updatedSlot = await prisma.slot.findUnique({ where: { id: slotId } });
    const updatedRegistrations = await prisma.registration.count({
      where: { user_id: userId, slot_id: slotId },
    });

    expect(updatedSlot.remaining_seats).toBe(initialSlot.remaining_seats - 1);
    expect(updatedRegistrations).toBe(initialRegistrations + 1);
  });
});

async function setupTestData(prisma: PrismaService, DATABASE_URL: string) {
  // 데이터베이스 초기화
  const prismaBinary = join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'node_modules',
    '.bin',
    'prisma',
  );
  execSync(`${prismaBinary} db push --skip-generate`, {
    env: {
      ...process.env,
      DATABASE_URL,
    },
  });

  // 테스트 데이터 삽입
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        name: 'Test User',
      },
      {
        id: 2,
        name: 'Test User 2',
      },
    ],
  });

  await prisma.slot.createMany({
    data: [
      {
        id: 1,
        title: 'Test Slot',
        speaker_name: 'Test Speaker',
        remaining_seats: 10,
        capacity: 10,
      },
      {
        id: 2,
        title: 'Test Slot 2',
        speaker_name: 'Test Speaker 2',
        remaining_seats: 0,
        capacity: 10,
      },
    ],
  });

  await prisma.registration.createMany({
    data: [
      {
        user_id: 1,
        slot_id: 1,
      },
    ],
  });
}
