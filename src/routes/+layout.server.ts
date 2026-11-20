import { createHash } from 'node:crypto';
import stylesheet from '../app.css?inline';
import { config } from '../lib/config.js';
import type { LayoutServerLoad } from './$types';
const cssVersion = createHash('sha256').update(stylesheet).digest('hex').slice(0, 12);
export const load: LayoutServerLoad = () => ({ site: { origin: config.origin, production: config.production, description: config.description, cssVersion } });
