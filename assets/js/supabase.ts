import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrexdlklxjifxnmtyphs.supabase.co/rest/v1/'
const supabaseAnonKey = 'sb_publishable_NbiPkGt73eT6TFW6ZDGE1g_vnZnRcF4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)