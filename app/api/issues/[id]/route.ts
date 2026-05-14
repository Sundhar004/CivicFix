import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Issue from '@/models/Issue'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const issue = await Issue.findById(params.id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const mappedIssue = { ...issue.toObject(), id: issue._id.toString() }

    return NextResponse.json(mappedIssue)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
