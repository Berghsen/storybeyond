import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export function createSupabaseServerClient() {
  return createRouteHandlerClient<Database>({
    cookies,
  })
}
