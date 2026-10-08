export type Notification = {
  id: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
};

export type Promotion = {
  id: string;
  title: string;
  description?: string;
  image?: string;
};
