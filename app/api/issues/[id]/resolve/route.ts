import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
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
