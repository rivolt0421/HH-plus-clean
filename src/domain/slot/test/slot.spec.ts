import { Slot } from '../slot';

describe('slot 객체 단위 테스트', () => {
  describe('slot 이 신청 가능한 상태인지 확인 할 수 있다.', () => {
    test('slot 의 잔여석이 0 이하면 신청이 불가능하다.', () => {
      const remainingSeats = 0;
      const slot = new Slot(1, remainingSeats, 'slot1', '김구루');

      expect(slot.isAvailable()).toBe(false);
    });
  });

  describe('slot 의 잔여석을 차감할 수 있다.', () => {
    test('slot 의 잔여석이 0 이하면 잔여석을 차감할 수 없다.', () => {
      const remainingSeats = 0;
      const slot = new Slot(1, remainingSeats, 'slot1', '김구루');

      expect(slot.decreaseRemainingSeats()).toBe(false);
    });
  });
});
