export class LoyaltyTier {
  private _id: number;
  private _uuid: string;
  private _name: string;
  private _description: string;
  private _entranceValue: number;

  get id(): number {
    return this._id;
  }

  get uuid(): string {
    return this._uuid;
  }
  set uuid(value: string) {
    this._uuid = value;
  }

  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  get description(): string {
    return this._description;
  }
  set description(value: string) {
    this._description = value;
  }

  get entranceValue(): number {
    return this._entranceValue;
  }
  set entranceValue(value: number) {
    this._entranceValue = value;
  }
  set lp_entrance(value: number) {
    this._entranceValue = value;
  }
}
