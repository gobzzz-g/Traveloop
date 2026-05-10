import { Response, NextFunction } from 'express';
import * as noteService from '../services/note.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getNotes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tripId, page, limit } = req.query as Record<string, string>;
    const result = await noteService.getNotes(req.user!.id, tripId, page, limit);
    sendResponse({ res, message: 'Notes retrieved', data: result.notes, meta: result.meta });
  } catch (error) { next(error); }
}

export async function createNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await noteService.createNote(req.user!.id, req.body);
    sendResponse({ res, statusCode: 201, message: 'Note created', data: note });
  } catch (error) { next(error); }
}

export async function updateNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const note = await noteService.updateNote(req.params.id, req.user!.id, req.body);
    sendResponse({ res, message: 'Note updated', data: note });
  } catch (error) { next(error); }
}

export async function deleteNote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await noteService.deleteNote(req.params.id, req.user!.id);
    sendResponse({ res, message: 'Note deleted' });
  } catch (error) { next(error); }
}
