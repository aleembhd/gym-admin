import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on the schema shown in the image
export interface MemberRecord {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  joined: string | null;
  amount: number | null;
  plan_months?: number | null;
  receipt_status?: boolean | string | null; // stored as text "true"/"false" in DB
  validity?: number | string | null;        // days left at time of plan selection
}
