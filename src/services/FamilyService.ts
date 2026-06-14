import { supabase } from '@/integrations/supabase/client';
import { getConditionalBase } from './LongevityCalculationService';

export interface FamilyMember {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  country: string;
  forecast_cache: number | null;
  score_cache: number | null;
}

export async function getFamilyMembers(userId: string): Promise<FamilyMember[]> {
  const { data } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return (data as FamilyMember[]) || [];
}

export async function addFamilyMember(
  userId: string,
  member: Omit<FamilyMember, 'id' | 'forecast_cache' | 'score_cache'>
): Promise<FamilyMember | null> {
  const forecast = calculateBaseForecast(member.date_of_birth, member.gender, member.country);
  const { data } = await supabase
    .from('family_members')
    .insert({ ...member, user_id: userId, forecast_cache: forecast })
    .select()
    .single();
  return data as FamilyMember | null;
}

export async function updateFamilyMember(
  memberId: string,
  updates: Partial<FamilyMember>
): Promise<void> {
  await supabase.from('family_members').update(updates).eq('id', memberId);
}

export async function deleteFamilyMember(memberId: string): Promise<void> {
  await supabase.from('family_members').delete().eq('id', memberId);
}

export function calculateBaseForecast(dob: string, gender: string, country: string): number {
  const birthDate = new Date(dob);
  const currentAge = Math.floor(
    (new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );
  const g = gender === 'female' ? 'female' : 'male';
  const { base } = getConditionalBase(country || 'Unknown', g, currentAge);
  return Math.round((base + 1.5) * 10) / 10;
}
