export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'KITCHEN_MANAGER'
  | 'OPERATIONS_MANAGER'
  | 'SUPPORT_AGENT'
  | 'FINANCE_MANAGER'
  | 'DRIVER'
  | 'CUSTOMER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isSuspended: boolean;
  createdAt: string;
};
