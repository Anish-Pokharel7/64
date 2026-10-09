import { User } from '@models/user';

export const mockUsers: User[] = [
  {
    id: 'u1',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9801234567',
    avatar: undefined,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    isSuspended: false,
    createdAt: '2024-01-15T10:00:00Z',
  },
];

export const mockCurrentUser: User = mockUsers[0];
