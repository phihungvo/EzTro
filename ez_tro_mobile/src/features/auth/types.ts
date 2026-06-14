export type AuthSession = {
  roles: string[];
  token: string;
  username: string;
};

export type LoginPayload = {
  password: string;
  username: string;
};
