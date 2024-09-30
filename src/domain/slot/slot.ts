export class Slot {
  constructor(
    public readonly id: number,
    private _remainingSeats: number,
    public readonly title: string,
    public readonly speakerName: string,
  ) {}

  get remainingSeats() {
    return this._remainingSeats;
  }
  isAvailable(): boolean {
    return this.remainingSeats > 0;
  }

  decreaseRemainingSeats(): boolean {
    if (this._remainingSeats <= 0) {
      return false;
    }

    this._remainingSeats -= 1;
    return true;
  }
}
