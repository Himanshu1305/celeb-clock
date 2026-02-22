import { WikiPerson, WikiEvent } from '@/services/WikimediaService';

export interface BirthdayData {
  people: WikiPerson[];
  events: WikiEvent[];
}

export type BirthdayDatabase = Record<string, BirthdayData>;
