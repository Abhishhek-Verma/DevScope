// Supabase database helper functions for DevScope

import { supabase } from './client';

// ==================== USER PROFILES ====================

export interface UserProfile {
  id?: string;
  user_id: string;
  github_id: string;
  github_username: string;
  github_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  email?: string;
  blog?: string;
  company?: string;
  twitter_username?: string;
  followers_count?: number;
  following_count?: number;
  public_repos_count?: number;
  total_stars?: number;
  total_commits?: number;
}

export async function upsertUserProfile(profile: UserProfile) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'github_id' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
}

// ==================== USER GOALS ====================

export interface UserGoal {
  id?: string;
  user_id: string;
  goal_name: string;
  target_value: number;
  current_value?: number;
  icon_name?: string;
  is_completed?: boolean;
}

export async function saveUserGoals(userId: string, goals: UserGoal[]) {
  // Delete existing goals
  await supabase.from('user_goals').delete().eq('user_id', userId);
  
  // Insert new goals
  const { data, error } = await supabase
    .from('user_goals')
    .insert(goals)
    .select();
  
  if (error) throw error;
  return data;
}

export async function getUserGoals(userId: string) {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateGoalProgress(goalId: string, currentValue: number, isCompleted: boolean) {
  const { data, error } = await supabase
    .from('user_goals')
    .update({ current_value: currentValue, is_completed: isCompleted })
    .eq('id', goalId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ==================== AI SUMMARIES ====================

export interface AISummary {
  id?: string;
  user_id: string;
  content: string;
  generation_type: 'gemini' | 'local';
  tokens_used?: number;
  model_version?: string;
}

export async function saveAISummary(summary: AISummary) {
  const { data, error } = await supabase
    .from('ai_summaries')
    .insert(summary)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getLatestAISummary(userId: string) {
  const { data, error } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
}

export async function getAllAISummaries(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// ==================== ACTIVITY LOGS ====================

export interface ActivityLog {
  id?: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  github_event_id?: string;
  occurred_at: string;
}

export async function saveActivityLog(log: ActivityLog) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert(log)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getActivityLogs(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// ==================== REPOSITORY SNAPSHOTS ====================

export interface RepositorySnapshot {
  id?: string;
  user_id: string;
  github_repo_id: string;
  repo_name: string;
  description?: string;
  language?: string;
  stars_count?: number;
  forks_count?: number;
  topics?: string[];
  is_fork?: boolean;
  homepage?: string;
}

export async function saveRepositorySnapshots(userId: string, repos: RepositorySnapshot[]) {
  const { data, error } = await supabase
    .from('repository_snapshots')
    .insert(repos)
    .select();
  
  if (error) throw error;
  return data;
}

export async function getLatestRepositorySnapshots(userId: string) {
  const { data, error } = await supabase
    .from('repository_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return data || [];
}

// ==================== MONTHLY STATS ====================

export interface MonthlyStats {
  id?: string;
  user_id: string;
  year: number;
  month: number;
  total_commits?: number;
  total_prs?: number;
  total_issues?: number;
  repos_created?: number;
  stars_received?: number;
}

export async function saveMonthlyStats(stats: MonthlyStats) {
  const { data, error } = await supabase
    .from('monthly_stats')
    .upsert(stats, { onConflict: 'user_id,year,month' })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getMonthlyStats(userId: string, limit = 12) {
  const { data, error } = await supabase
    .from('monthly_stats')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}
