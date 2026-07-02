// @ts-check
import { requireEnv } from '../utils/env.js';

export const standardUser = {
  email: requireEnv('TEST_USER_EMAIL'),
  password: requireEnv('TEST_USER_PASSWORD'),
};
