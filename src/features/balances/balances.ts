export interface Balances {
  cardBalance: {
    total: number;
  };
  cashBalance: {
    fives: number;
    tens: number;
    twenties: number;
    fifties: number;
    hundreds: number;
    total: number;
  };
  variance: number;
}

export interface CurrentBalanceSummary {
  from: Date;
  to: Date;
  expectedCashBalance: number;
  expectedCardBalance: number;
  totalExpectedBalance: number;
  actualCashBalance: number;
  actualCardBalance: number;
  totalActualBalance: number;
  variance: number;
}
