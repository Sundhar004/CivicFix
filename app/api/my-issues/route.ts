import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Issue from '@/models/Issue'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    await connectToDatabase()
    
    const issues = await Issue.find({ createdBy: userId }).sort({ createdAt: -1 })
    
    const mappedIssues = issues.map(issue => {
      const obj = issue.toObject();
      return { ...obj, id: obj._id.toString(), created_at: obj.createdAt, image_url: obj.imageUrl };
    });

    return NextResponse.json(mappedIssues)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
