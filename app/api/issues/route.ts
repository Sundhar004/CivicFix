import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  )

  const { data, error } = await supabase.from('issues').select('*').order('created_at', { ascending: false })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  )

  const body = await req.json()
  
  const { data, error } = await supabase.from('issues').insert({
    title: body.title,
    description: body.description,
    lat: body.lat,
    lng: body.lng,
    image_url: body.image_url,
    created_by: body.created_by
  }).select()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data[0])
}
