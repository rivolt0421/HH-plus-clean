import { SlotRepo } from '../interface/slot.repository';
import { Slot } from '../slot';
import { SlotService } from '../slot.service';

describe('slot service 단위 테스트', () => {
  let slotService: SlotService;
  let mockSlotRepo: jest.Mocked<SlotRepo>;

  beforeEach(() => {
    mockSlotRepo = {
      getAllSlots: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
    };

    slotService = new SlotService(mockSlotRepo);
  });

  describe('id로 slot을 조회한다.', () => {
    test('slot이 존재하지 않으면 에러 발생.', async () => {
      const slotId = 1;

      mockSlotRepo.getById.mockResolvedValue(null);

      await expect(slotService.getById(slotId)).rejects.toThrow(
        'slot이 존재하지 않습니다.',
      );
    });
  });

  test('신청 가능한 slot 목록을 조회한다.', async () => {
    const availableSlot = new Slot(1, 10, 'slot1', '김구루');
    const unavailableSlot = new Slot(2, 0, 'slot2', '이구루');
    const slots: Slot[] = [availableSlot, unavailableSlot];

    mockSlotRepo.getAllSlots.mockResolvedValue(slots);

    const result = await slotService.getAvailableSlots();

    expect(result).toEqual([availableSlot]);
  });

  describe('slot의 잔여석을 차감한다.', () => {
    test('slot 을 찾을 수 없으면 에러 발생.', async () => {
      const slotId = 1;

      mockSlotRepo.getById.mockResolvedValue(null);

      await expect(slotService.decreaseRemaingSeats(slotId)).rejects.toThrow(
        'slot이 존재하지 않습니다.',
      );
    });

    test('slot 의 잔여석을 차감할 수 없으면 에러 발생.', async () => {
      const slotId = 1;
      const emptySlot = new Slot(slotId, 0, 'slot1', '김구루');

      mockSlotRepo.getById.mockResolvedValue(emptySlot);

      await expect(slotService.decreaseRemaingSeats(slotId)).rejects.toThrow(
        'slot의 잔여석을 차감할 수 없습니다.',
      );
    });
  });
});
