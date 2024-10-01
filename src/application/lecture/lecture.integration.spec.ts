import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import { LectureFacade } from './lecture.facade';
import { join } from 'path';
import { execSync } from 'child_process';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

describe('LectureFacade Integration Test', () => {
  let app: INestApplication;
  let lectureFacade: LectureFacade;
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaService;

  beforeAll(async () => {
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

    lectureFacade = moduleFixture.get<LectureFacade>(LectureFacade);
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await setupTestDatabase(DATABASE_URL);
  }, 10000);

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await container.stop();
  });

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.registration.deleteMany(),
      prisma.slot.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  it('동시에 동일한 특강에 대해 40명이 신청했을 때, 30명만 신청에 성공해야 한다.', async () => {
    // 테스트용 특강 생성
    const slot = await prisma.slot.create({
      data: {
        title: 'Test Lecture',
        speaker_name: 'Test Speaker',
        remaining_seats: 30,
        capacity: 30,
      },
    });

    // 40명의 사용자 생성
    const users = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        prisma.user.create({
          data: {
            name: `User ${i + 1}`,
          },
        }),
      ),
    );

    // 동시에 40개의 등록 요청 실행
    const registrationPromises = users.map((user) =>
      lectureFacade.doRegister(user.id, slot.id),
    );

    const results = await Promise.allSettled(registrationPromises);

    // 결과 검증
    const successfulRegistrations = results.filter(
      (result) => result.status === 'fulfilled' && result.value === true,
    ).length;

    const failedRegistrations = results.filter(
      (result) => result.status === 'rejected' || result.value === false,
    ).length;

    expect(successfulRegistrations).toBe(30);
    expect(failedRegistrations).toBe(10);

    // 데이터베이스 상태 확인
    const updatedSlot = await prisma.slot.findUnique({
      where: { id: slot.id },
    });
    expect(updatedSlot.remaining_seats).toBe(0);

    const registrationCount = await prisma.registration.count({
      where: { slot_id: slot.id },
    });
    expect(registrationCount).toBe(30);
  }, 30000);

  it('동일한 유저 정보로 같은 특강을 5번 신청했을 때, 1번만 성공해야 한다.', async () => {
    // 테스트용 특강 생성
    const slot = await prisma.slot.create({
      data: {
        title: 'Test Lecture',
        speaker_name: 'Test Speaker',
        remaining_seats: 30,
        capacity: 30,
      },
    });

    // 테스트용 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
      },
    });

    // 동일한 사용자가 같은 특강을 5번 신청
    const registrationPromises = Array(5)
      .fill(null)
      .map(() => lectureFacade.doRegister(user.id, slot.id));

    const results = await Promise.allSettled(registrationPromises);

    // 결과 검증
    const successfulRegistrations = results.filter(
      (result) => result.status === 'fulfilled' && result.value === true,
    ).length;

    const failedRegistrations = results.filter(
      (result) => result.status === 'rejected' || result.value === false,
    ).length;

    expect(successfulRegistrations).toBe(1);
    expect(failedRegistrations).toBe(4);

    // 데이터베이스 상태 확인
    const updatedSlot = await prisma.slot.findUnique({
      where: { id: slot.id },
    });
    expect(updatedSlot.remaining_seats).toBe(29);

    const registrationCount = await prisma.registration.count({
      where: {
        slot_id: slot.id,
        user_id: user.id,
      },
    });
    expect(registrationCount).toBe(1);
  }, 30000);
});

async function setupTestDatabase(DATABASE_URL: string) {
  // 데이터베이스 초기화
  const prismaBinary = join(
    __dirname,
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
}
