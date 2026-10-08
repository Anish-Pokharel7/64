export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
