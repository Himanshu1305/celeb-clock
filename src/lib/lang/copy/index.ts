/** B18 — page copy of every regional language (loaded only by the language pages). */
import type { LangCode, LangCopy } from '../types';
import ta from './ta';
import te from './te';
import bn from './bn';
import mr from './mr';
import gu from './gu';
import kn from './kn';
import ml from './ml';
import pa from './pa';

export const COPY: Record<LangCode, LangCopy> = { ta, te, bn, mr, gu, kn, ml, pa };
