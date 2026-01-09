import { supabase } from "@/integrations/supabase/client";

const TRIAL_DURATION_MINUTES = 15;
const TRIAL_SESSION_KEY = 'dailymotion_trial_session';

export interface TrialSession {
  id: string;
  session_id: string;
  started_at: string;
  expires_at: string;
  video_count: number;
  created_at: string;
}

function generateSessionId(): string {
  return `trial_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export async function getOrCreateTrialSession(): Promise<TrialSession | null> {
  // Check localStorage for existing session ID
  let sessionId = localStorage.getItem(TRIAL_SESSION_KEY);
  
  if (sessionId) {
    // Try to fetch existing session
    const { data: existingSession, error } = await supabase
      .from('trial_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (!error && existingSession) {
      return existingSession as TrialSession;
    }
  }
  
  // Create new session
  sessionId = generateSessionId();
  localStorage.setItem(TRIAL_SESSION_KEY, sessionId);
  
  const { data: newSession, error } = await supabase
    .from('trial_sessions')
    .insert({
      session_id: sessionId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating trial session:', error);
    return null;
  }
  
  return newSession as TrialSession;
}

export async function getTrialSession(): Promise<TrialSession | null> {
  const sessionId = localStorage.getItem(TRIAL_SESSION_KEY);
  if (!sessionId) return null;
  
  const { data, error } = await supabase
    .from('trial_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  
  if (error) return null;
  return data as TrialSession;
}

export async function isTrialActive(): Promise<boolean> {
  const session = await getTrialSession();
  if (!session) return false;
  
  const expiresAt = new Date(session.expires_at);
  return expiresAt > new Date();
}

export async function getTrialTimeRemaining(): Promise<number> {
  const session = await getTrialSession();
  if (!session) return 0;
  
  const expiresAt = new Date(session.expires_at);
  const now = new Date();
  const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
  
  return Math.floor(remaining / 1000); // Return seconds
}

export async function incrementTrialVideoCount(): Promise<void> {
  const sessionId = localStorage.getItem(TRIAL_SESSION_KEY);
  if (!sessionId) return;
  
  const session = await getTrialSession();
  if (!session) return;
  
  await supabase
    .from('trial_sessions')
    .update({ video_count: (session.video_count || 0) + 1 })
    .eq('session_id', sessionId);
}

export function hasTrialBeenUsed(): boolean {
  return localStorage.getItem(TRIAL_SESSION_KEY) !== null;
}

export function clearTrialSession(): void {
  localStorage.removeItem(TRIAL_SESSION_KEY);
}
