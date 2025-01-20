import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tivezzraffcybljiicvw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdmV6enJhZmZjeWJsamlpY3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4NDQyNjAsImV4cCI6MjA0NjQyMDI2MH0.DsszmAoMvG8pHv3I4dD6_UxbwviA1mlLOoM8_uJ2pW4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 