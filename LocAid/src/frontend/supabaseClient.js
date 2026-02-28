import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ipssqtkegolcjsgizzff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwc3NxdGtlZ29sY2pzZ2l6emZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQyNjYsImV4cCI6MjA4Nzg3MDI2Nn0.pl7YR9-EQJyeFVPdInK_5r4ECQ23I-yH_K17UvgX1ig';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

