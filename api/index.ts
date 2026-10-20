import app from '../server';
import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  // Support Vercel serverless request routing and headers
  const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-url'] as string);
  if (matched && matched.startsWith('/api') && !req.url.startsWith('/api')) {
    req.url = matched;
  }
  return (app as any)(req, res);
}

