export interface IAccount {
  id: string;
  email: string;
  password: string;

  signUpAt: Date | string;
}
