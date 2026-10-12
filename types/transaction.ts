export enum ModalMode {
  PARTY,
  CASHBOOK,
  ACCOUNT,
}

export enum TransactionDirection {
  IN = "IN",
  OUT = "OUT",
  NEUTRAL = "NEUTRAL",
}

export interface TransactionRes {
  id: string;
  amount: number;
  date: Date;
  description: string | null;
  createdAt: Date;
  fromAccountId: string;
  toAccountId: string;
  fromAccount?: { name: string; type: string };
  toAccount?: { name: string; type: string };
  party?: { name: string };
}
