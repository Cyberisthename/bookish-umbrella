import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let notes

    if (search) {
      notes = await db.note.findMany({
        where: {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      notes = await db.note.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, tags, mood } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const note = await db.note.create({
      data: {
        title,
        content,
        tags,
        mood
      }
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
