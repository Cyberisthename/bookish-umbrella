import { db } from '../../src/lib/db'

export async function getNotes() {
  const notes = await db.note.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return { notes }
}

export async function createNote(noteData: { title: string; content: string; tags?: string; mood?: string }) {
  if (!noteData.title || !noteData.content) {
    throw new Error('Title and content are required')
  }

  const note = await db.note.create({
    data: {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      mood: noteData.mood
    }
  })

  return { note }
}

export async function updateNote(id: string, noteData: { title: string; content: string; tags?: string; mood?: string }) {
  const note = await db.note.update({
    where: { id },
    data: {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      mood: noteData.mood,
      updatedAt: new Date()
    }
  })

  return { note }
}

export async function deleteNote(id: string) {
  await db.note.delete({
    where: { id }
  })

  return { message: 'Note deleted successfully' }
}

export async function searchNotes(query: string) {
  if (!query) {
    return getNotes()
  }

  const notes = await db.note.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return { notes }
}
