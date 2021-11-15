import { JwtPayload } from 'jsonwebtoken';

export interface IJwtPayload extends JwtPayload {
  /**
   * Account ID
   */
  aid: string;

  /**
   * Assigned roles
   */
  roles: string[];
}
