export const UserRoles = ["SuperAdmin", "Admin", "User"] as const;
export type UserRole = typeof UserRoles[number];

export const UserStatuses = ["Pending", "Active", "Suspended", "Deleted"] as const;
export type UserStatus = typeof UserStatuses[number];

export interface IUser {
  _id: string,
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  isDriver: boolean;
  role: UserRole;
  status: UserStatus
  password?: string;
  isPasswordSet: boolean;
  createdAt: Date;
  updatedAt: Date;
  suspendedAt?: Date;
  deletedAt?: Date;
}