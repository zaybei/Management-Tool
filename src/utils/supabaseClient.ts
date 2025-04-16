import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgjkttwnawrvhstdgbkj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnamt0dHduYXdydmhzdGRnYmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3ODg2NzgsImV4cCI6MjA1NTM2NDY3OH0.m1g1c2yDirhwq311aEdoDnBnNb-8rSO3YOm_-NrVvCg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
