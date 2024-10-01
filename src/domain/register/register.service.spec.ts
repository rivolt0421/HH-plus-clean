import { RegistrationRepo } from './interface/registration.repository';
import { Registration } from './register';
import { RegisterService } from './register.service';

describe('register service 단위 테스트', () => {
  let service: RegisterService;
  let mockRegistrationRepo: jest.Mocked<RegistrationRepo>;

  beforeEach(async () => {
    mockRegistrationRepo = {
      create: jest.fn(),
      getByUserId: jest.fn(),
    };

    service = new RegisterService(mockRegistrationRepo);
  });

  describe('유저를 slot 에 등록한다.', () => {
    test('새로운 등록이 생성되는지.', async () => {
      const userId = 1;
      const slotId = 2;
      const expectedRegistration: Registration = { id: 1, userId, slotId };

      mockRegistrationRepo.create.mockResolvedValue(expectedRegistration);

      const result = await service.register(userId, slotId);

      expect(result).toEqual(expectedRegistration);
    });
  });

  describe('유저가 신청 완료한 특강 목록을 조회한다.', () => {
    test('유저가 신청한 특강 목록을 반환하는지.', async () => {
      const userId = 1;
      const expectedRegistrations: Registration[] = [
        { id: 1, userId, slotId: 2 },
        { id: 2, userId, slotId: 3 },
      ];

      mockRegistrationRepo.getByUserId.mockResolvedValue(expectedRegistrations);

      const result = await service.getOfUser(userId);

      expect(result).toEqual(expectedRegistrations);
    });
  });
});
