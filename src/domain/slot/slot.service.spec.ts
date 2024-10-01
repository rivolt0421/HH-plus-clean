import { SlotRepo } from './interface/slot.repository';
import { Slot } from './slot';
import { SlotDecreaseFailedError, SlotService } from './slot.service';

describe('slot service 단위 테스트', () => {
  let slotService: SlotService;
  let mockSlotRepo: jest.Mocked<SlotRepo>;

  beforeEach(() => {
    mockSlotRepo = {
      getAllSlots: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
      decreaseSafely: jest.fn(),
    };

    slotService = new SlotService(mockSlotRepo);
  });

  describe('id로 slot을 조회한다.', () => {
    test('slot이 존재하지 않으면 에러 발생.', async () => {
      const slotId = 1;

      mockSlotRepo.getById.mockResolvedValue(null);

      await expect(slotService.getById(slotId)).rejects.toThrow(
        '특강이 존재하지 않습니다.',
      );
    });
  });

  describe('신청 가능한 slot 목록을 조회한다.', () => {
    test('남은 좌석이 0보다  큰 slot만 조회된다.', async () => {
      const availableSlot = new Slot(1, 10, 'slot1', '김구루');
      const unavailableSlot = new Slot(2, 0, 'slot2', '이구루');
      const slots: Slot[] = [availableSlot, unavailableSlot];

      mockSlotRepo.getAllSlots.mockResolvedValue(slots);

      const result = await slotService.getAvailableSlots();

      expect(result).toEqual([availableSlot]);
    });
  });

  describe('slot의 잔여석을 차감한다.', () => {
    test('slot 을 찾을 수 없으면 에러 발생.', async () => {
      const slotId = 1;

      mockSlotRepo.getById.mockResolvedValue(null);

      await expect(slotService.decreaseRemaingSeats(slotId)).rejects.toThrow(
        '특강이 존재하지 않습니다.',
      );
    });

    test('slot 의 잔여석이 0이하면 에러 발생.', async () => {
      const slotId = 1;
      const emptySlot = new Slot(slotId, 0, 'slot1', '김구루');

      mockSlotRepo.getById.mockResolvedValue(emptySlot);

      await expect(slotService.decreaseRemaingSeats(slotId)).rejects.toThrow(
        '특강에 남은 좌석이 없습니다.',
      );
    });

    test('slot 업데이트 실패시 에러 발생.', async () => {
      const slotId = 1;
      const slot = new Slot(slotId, 10, 'slot1', '김구루');

      mockSlotRepo.getById.mockResolvedValue(slot);
      mockSlotRepo.decreaseSafely.mockRejectedValue(
        new SlotDecreaseFailedError(),
      );

      await expect(slotService.decreaseRemaingSeats(slotId)).rejects.toThrow(
        '남은 좌석이 없습니다.',
      );
    });
  });
});
