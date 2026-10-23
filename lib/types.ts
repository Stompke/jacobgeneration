export const SIGNUP_STATUSES = ["pending", "approved", "denied", "released"] as const;

export type SignupStatus = (typeof SIGNUP_STATUSES)[number];

export type Signup = {
  id: string;
  hour: number;
  name: string;
  email: string;
  phone: string;
  note: string;
  status: SignupStatus;
  createdAt: string;
  updatedAt: string;
};

export type SignupInput = {
  hour: number;
  name: string;
  email: string;
  phone: string;
  note: string;
};
