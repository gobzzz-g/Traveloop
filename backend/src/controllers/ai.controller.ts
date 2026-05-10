import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';
import { sendResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

export async function generateItinerary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, 'AI service not configured. Please add GEMINI_API_KEY to your environment.');
    }
    const result = await aiService.generateItinerary(req.body);
    sendResponse({ res, message: 'Itinerary generated successfully', data: result });
  } catch (error) { next(error); }
}

export async function estimateBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, 'AI service not configured. Please add GEMINI_API_KEY to your environment.');
    }
    const result = await aiService.estimateBudget(req.body);
    sendResponse({ res, message: 'Budget estimated successfully', data: result });
  } catch (error) { next(error); }
}

export async function chat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, 'AI service not configured. Please add GEMINI_API_KEY to your environment.');
    }
    const { message, history, context } = req.body;
    if (!message) throw new ApiError(400, 'Message is required');
    const reply = await aiService.chatWithAssistant(message, history || [], context);
    sendResponse({ res, message: 'Response generated', data: { reply } });
  } catch (error) { next(error); }
}

export async function generatePackingList(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, 'AI service not configured. Please add GEMINI_API_KEY to your environment.');
    }
    const result = await aiService.generatePackingList(req.body);
    sendResponse({ res, message: 'Packing list generated', data: result });
  } catch (error) { next(error); }
}

export async function getDestinationInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, 'AI service not configured. Please add GEMINI_API_KEY to your environment.');
    }
    const { city, country } = req.params;
    const result = await aiService.getAIDestinationInsights(city, country);
    sendResponse({ res, message: 'Destination insights retrieved', data: result });
  } catch (error) { next(error); }
}
