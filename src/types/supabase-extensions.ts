// Manual type extension for tables added after the last auto-generation.
// When supabase types are regenerated, move these into types.ts and delete this file.

import type { Database } from '@/integrations/supabase/types';

export type CelebritySitelinksRow =
  Database['public']['Tables']['celebrity_sitelinks']['Row'];

export type CelebritySitelinksInsert =
  Database['public']['Tables']['celebrity_sitelinks']['Insert'];
