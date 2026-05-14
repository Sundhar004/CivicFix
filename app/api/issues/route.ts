import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    // Find all issues, sorted by created_at descending
    const issues = await Issue.find({}).sort({ createdAt: -1 })
    
    // Map _id to id to maintain frontend compatibility
    const mappedIssues = issues.map(issue => {
      const obj = issue.toObject();
      return { ...obj, id: obj._id.toString(), created_at: obj.createdAt };
    });

    return NextResponse.json(mappedIssues)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const body = await req.json()
    
    const issue = await Issue.create({
      title: body.title,
      description: body.description,
      lat: body.lat,
      lng: body.lng,
      imageUrl: body.image_url,
      createdBy: (session.user as any).id,
    })

    const mappedIssue = { ...issue.toObject(), id: issue._id.toString() }

    return NextResponse.json(mappedIssue)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
