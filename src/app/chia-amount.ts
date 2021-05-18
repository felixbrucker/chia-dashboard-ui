import BigNumber from 'bignumber.js';

export default class ChiaAmount {
  public amountBN: BigNumber;
  static get decimalPlaces() {
    return 12;
  }

  static fromRaw(amount) {
    return new ChiaAmount(new BigNumber(amount).shiftedBy(-ChiaAmount.decimalPlaces));
  }

  constructor(amount) {
    this.amountBN = new BigNumber(amount);
  }

  toRaw() {
    return this.amountBN.shiftedBy(ChiaAmount.decimalPlaces).integerValue(BigNumber.ROUND_FLOOR);
  }

  toString() {
    return this.amountBN.toString();
  }
}
