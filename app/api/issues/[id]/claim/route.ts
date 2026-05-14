import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Issue from '@/models/Issue'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'officer') {
      return NextResponse.json({ error: 'Only officers can claim issues' }, { status: 403 })
    }

    await connectToDatabase()

    const issue = await Issue.findByIdAndUpdate(
      params.id,
      {
        status: 'claimed',
        claimedBy: (session.user as any).id,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const mappedIssue = { ...issue.toObject(), id: issue._id.toString() }

    return NextResponse.json(mappedIssue)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
