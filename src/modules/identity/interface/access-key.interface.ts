import { IAccount } from './account.interface';

export interface IAccessKey {
  key: string;
  accountId: string;
  issuedAt: string | Date;

  account?: IAccount;
}
