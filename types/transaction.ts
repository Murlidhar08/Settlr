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

export interface TransactionDocumentRes {
  id: string;
  transactionId: string;
  fileName: string;
  fileSize?: number | null;
  fileType?: string | null;
  documentRelativePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionDocumentInput {
  id?: string;
  fileName: string;
  fileSize?: number | null;
  fileType?: string | null;
  documentRelativePath: string;
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
  documents?: TransactionDocumentRes[];
}
