import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { NoteMood } from '@prisma/client';
import { getPaginationParams, buildMeta } from '../utils/response';

export async function getNotes(userId: string, tripId?: string, page?: string, limit?: string) {
  const { skip, take, page: p, limit: l } = getPaginationParams(page, limit);

  const where = { userId, ...(tripId && { tripId }) };
  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take,
      include: { trip: { select: { id: true, title: true } } },
    }),
    prisma.note.count({ where }),
  ]);

  const formattedNotes = notes.map(n => ({
    ...n,
    photos: n.photos ? n.photos.split(',').filter(Boolean) : [],
    tags: n.tags ? n.tags.split(',').filter(Boolean) : []
  }));

  return { notes: formattedNotes, meta: buildMeta(total, p, l) };
}

export async function createNote(userId: string, data: {
  tripId?: string;
  title?: string;
  content: string;
  mood?: NoteMood;
  photos?: string[];
  tags?: string[];
  date?: string;
}) {
  if (data.tripId) {
    const trip = await prisma.trip.findFirst({ where: { id: data.tripId, userId } });
    if (!trip) throw new ApiError(404, 'Trip not found');
  }

  const note = await prisma.note.create({
    data: {
      userId,
      tripId: data.tripId,
      title: data.title,
      content: data.content,
      mood: data.mood || 'NEUTRAL',
      photos: data.photos ? data.photos.join(',') : "",
      tags: data.tags ? data.tags.join(',') : "",
      date: data.date ? new Date(data.date) : new Date(),
    },
    include: { trip: { select: { id: true, title: true } } },
  });

  return {
    ...note,
    photos: note.photos ? note.photos.split(',').filter(Boolean) : [],
    tags: note.tags ? note.tags.split(',').filter(Boolean) : []
  };
}

export async function updateNote(noteId: string, userId: string, data: Partial<{
  title: string;
  content: string;
  mood: NoteMood;
  photos: string[];
  tags: string[];
  date: string;
}>) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new ApiError(404, 'Note not found');

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: { 
      ...data, 
      photos: data.photos ? data.photos.join(',') : undefined,
      tags: data.tags ? data.tags.join(',') : undefined,
      date: data.date ? new Date(data.date) : undefined 
    },
  });

  return {
    ...updated,
    photos: updated.photos ? updated.photos.split(',').filter(Boolean) : [],
    tags: updated.tags ? updated.tags.split(',').filter(Boolean) : []
  };
}

export async function deleteNote(noteId: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
  if (!note) throw new ApiError(404, 'Note not found');
  await prisma.note.delete({ where: { id: noteId } });
}
