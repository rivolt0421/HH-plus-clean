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
}
