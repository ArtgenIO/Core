import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export const ROOT_DIR = join(__dirname, '../../');
export const SEED_DIR = join(__dirname, '../../storage/seed');
