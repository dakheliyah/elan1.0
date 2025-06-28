/// <reference types="./types.d.ts" />

// Using built-in Deno.serve instead of deprecated std/http/server
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CompressRequest {
  imageData: string; // base64 encoded image
  maxWidth?: number;
  quality?: number;
  filename?: string;
}

interface CompressResponse {
  success: boolean;
  compressedData?: string; // base64 encoded WebP
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const { imageData, maxWidth = 1920, quality = 80, filename }: CompressRequest = await req.json();

    if (!imageData) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image data provided' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const originalBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const originalSize = originalBuffer.length;

    // Use Sharp for image processing
    // @ts-ignore: ESM import
    const sharpModule = await import('https://esm.sh/sharp@0.32.6');
    // @ts-ignore: Default import
    const sharp = sharpModule.default;
    
    let pipeline = sharp(originalBuffer);
    
    // Get image metadata
    const metadata = await pipeline.metadata();
    
    // Resize if image is wider than maxWidth
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, undefined, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Convert to WebP with specified quality
    const compressedBuffer = await pipeline
      .webp({ quality })
      .toBuffer();
    
    const compressedSize = compressedBuffer.length;
    const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);
    
    // Convert to base64
    const compressedData = btoa(String.fromCharCode(...compressedBuffer));
    
    const response: CompressResponse = {
      success: true,
      compressedData: `data:image/webp;base64,${compressedData}`,
      originalSize,
      compressedSize,
      compressionRatio
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Compression error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to compress image' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});