import { NextRequest, NextResponse } from 'next/server';
import { conversionService } from '@/lib/services/conversion';
import { conversionRequestSchema } from '@/lib/validations/conversion';
import { ERROR_MESSAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request
    const validatedRequest = conversionRequestSchema.parse(body);
    
    // Convert the URL
    const result = await conversionService.convertUrl(validatedRequest);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Conversion API error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Handle known conversion errors
    if (error instanceof Error) {
      const status = error.message.includes('fetch') ? 400 : 500;
      return NextResponse.json(
        { error: error.message },
        { status }
      );
    }
    
    // Handle unknown errors
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNKNOWN },
      { status: 500 }
    );
  }
}

// Optional: Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}