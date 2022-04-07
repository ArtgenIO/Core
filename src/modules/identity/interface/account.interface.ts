export interface IAccount {
  id: string;
  email: string;
  password: string;

  groupId: string;

  signUpAt: Date | string;
}
