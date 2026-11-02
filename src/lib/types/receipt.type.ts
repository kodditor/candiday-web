export const ReceiptStatuses = ["Pending", "Approved", "Flagged", "Rejected"] as const;
export type ReceiptStatus = typeof ReceiptStatuses[number];

export const ReceiptHistoryActions = ["Create", "Approve", "Reject", "Flag"] as const;
export type ReceiptHistoryAction = typeof ReceiptHistoryActions[number];

export interface Amount {
  currency: string;
  value: number;
}

export interface Geolocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IReceiptHistory {
  action: ReceiptHistoryAction;
  actor: string;
  message: string;
  timestamp: string;
}

export interface IReceipt {
  _id: string;
  code: string;
  image: string;
  status: ReceiptStatus;
  station: string;
  amount: Amount;
  notes?: string;
  timestamp: string;
  geolocation: Geolocation;
  organization: string;
  driver: string;
  vehicle: string;
  history: IReceiptHistory[];
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  flaggedBy?: string;
  flaggedAt?: string;
  flagNotes?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionNotes?: string;
  createdAt: string;
  updatedAt: string;
}