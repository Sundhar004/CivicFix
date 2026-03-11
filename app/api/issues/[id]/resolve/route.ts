import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const authHeader = req.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 101 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  )

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Get user and verify role
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { data: roleData, error: roleError } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'officer') {
      return NextResponse.json({ error: 'Only officers can resolve issues' }, { status: 403 })
    }

    // 2. Perform the update
    const { data: issue, error } = await adminSupabase
      .from('issues')
      .update({
        status: 'fixed',
        fixed_image_url: body.fixedUrl,
        resolution_comment: body.comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()

    if (error) throw error

    return NextResponse.json(issue[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
