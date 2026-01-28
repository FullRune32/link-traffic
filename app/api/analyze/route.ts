import { NextResponse } from 'next/server';
import { analyzeUrls } from '@/lib/analyzer';
import { AnalyzeRequest, AnalyzeResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of URLs' },
        { status: 400 }
      );
    }

    // Validate URLs
    const validUrls: string[] = [];
    const errors: string[] = [];

    for (const url of body.urls) {
      try {
        new URL(url);
        validUrls.push(url);
      } catch {
        errors.push(`Invalid URL: ${url}`);
      }
    }

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided', details: errors },
        { status: 400 }
      );
    }

    const results = await analyzeUrls(validUrls);

    const response: AnalyzeResponse = { results };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze URLs' },
      { status: 500 }
    );
  }
}
