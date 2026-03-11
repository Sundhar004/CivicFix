import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jdrezuroxgczkalfnupm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error("Supabase URL is missing or incorrect. Check Netlify Environment Variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
