import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IJwtPayload } from '../interface/jwt-payload.interface';

// Use UTC as we sign the token with UTC timezone
dayjs.extend(utc);

const decode = (token: string): IJwtPayload => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

/**
 * Calculates the miliseconds left until the token is expiring,
 * if the token is invalid, it returns a -1 value.
 *
 * @param {string} token
 * @returns {number}
 */
export const getTokenExpiration = (token: string): number => {
  const payload = decode(token);

  // Could be some invalid token leftover.
  if (payload?.exp) {
    // Calculate the miliseconds until the token expires.
    return dayjs.unix(payload.exp).diff(dayjs.utc());
  }

  return -1;
};
