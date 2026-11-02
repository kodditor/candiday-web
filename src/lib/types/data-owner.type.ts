export const DataOwnerDigestFrequencies = ["daily", "weekly"] as const;
export type DataOwnerDigestFrequency = typeof DataOwnerDigestFrequencies[number];

export const DataOwnerStatuses = ["active", "archived"] as const;
export type DataOwnerStatus = typeof DataOwnerStatuses[number];

export type IDataOwner = {
  _id: string;
  orgId: string;
  name: string;
  email: string;
  role?: string;
  clerkUserId?: string | null;
  digestFrequency: DataOwnerDigestFrequency;
  notificationsEnabled: boolean;
  status: DataOwnerStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateDataOwnerPayload = {
  name: string;
  email: string;
  role?: string;
  digestFrequency?: DataOwnerDigestFrequency;
  notificationsEnabled?: boolean;
};

export type UpdateDataOwnerPayload = Partial<CreateDataOwnerPayload>;

export type ListDataOwnersParams = {
  query?: string | null;
  page?: number;
  limit?: number;
  status?: DataOwnerStatus | null;
};
