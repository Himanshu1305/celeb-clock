import { BirthdayDatabase } from './types';
import { januaryBirthdays } from './january';
import { februaryBirthdays } from './february';
import { marchBirthdays } from './march';
import { aprilBirthdays } from './april';
import { mayBirthdays } from './may';
import { juneBirthdays } from './june';
import { julyBirthdays } from './july';
import { augustBirthdays } from './august';
import { septemberBirthdays } from './september';
import { octoberBirthdays } from './october';
import { novemberBirthdays } from './november';
import { decemberBirthdays } from './december';

export const allBirthdays: BirthdayDatabase = {
  ...januaryBirthdays,
  ...februaryBirthdays,
  ...marchBirthdays,
  ...aprilBirthdays,
  ...mayBirthdays,
  ...juneBirthdays,
  ...julyBirthdays,
  ...augustBirthdays,
  ...septemberBirthdays,
  ...octoberBirthdays,
  ...novemberBirthdays,
  ...decemberBirthdays,
};

export type { BirthdayData, BirthdayDatabase } from './types';
