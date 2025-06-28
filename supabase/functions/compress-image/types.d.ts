// Deno namespace declaration
declare global {
  namespace Deno {
    export function serve(handler: (request: Request) => Response | Promise<Response>): void;
    export const env: {
      get(key: string): string | undefined;
    };
  }
  
  // Global type for dynamic imports
  interface ImportMeta {
    url: string;
  }
  
  // Global type for dynamic Sharp import
  var sharp: {
    (input: Uint8Array | Buffer | string): {
      resize(options: { width?: number; height?: number; withoutEnlargement?: boolean }): any;
      resize(width?: number, height?: number, options?: { withoutEnlargement?: boolean; fit?: string }): any;
      jpeg(options: { quality?: number; progressive?: boolean }): any;
      png(options?: { quality?: number }): any;
      webp(options?: { quality?: number }): any;
      metadata(): Promise<{ width?: number; height?: number; format?: string }>;
      toBuffer(): Promise<Uint8Array>;
      toFile(path: string): Promise<any>;
    };
  };
}

// Supabase client types
declare module "@supabase/supabase-js" {
  export interface SupabaseClient {
    from(table: string): any;
    auth: any;
    storage: any;
  }
  
  export interface Database {
    public: {
      Tables: Record<string, any>;
    };
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}

// Supabase ESM import mapping
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClient {
    from(table: string): any;
    auth: any;
    storage: any;
  }
  
  export interface Database {
    public: {
      Tables: Record<string, any>;
    };
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}

// Sharp module types
declare module "sharp" {
  interface Sharp {
    resize(options: { width?: number; height?: number; withoutEnlargement?: boolean }): Sharp;
    resize(width?: number, height?: number, options?: { withoutEnlargement?: boolean; fit?: string }): Sharp;
    jpeg(options: { quality?: number; progressive?: boolean }): Sharp;
    png(options?: { quality?: number }): Sharp;
    webp(options?: { quality?: number }): Sharp;
    metadata(): Promise<{ width?: number; height?: number; format?: string }>;
    toBuffer(): Promise<Uint8Array>;
    toFile(path: string): Promise<any>;
  }
  
  interface SharpStatic {
    (input: Uint8Array | Buffer | string): Sharp;
  }
  
  const sharp: SharpStatic;
  export = sharp;
  export default sharp;
}

// Sharp ESM import mapping
declare module "https://esm.sh/sharp@0.32.6" {
  interface Sharp {
    resize(options: { width?: number; height?: number; withoutEnlargement?: boolean }): Sharp;
    resize(width?: number, height?: number, options?: { withoutEnlargement?: boolean; fit?: string }): Sharp;
    jpeg(options: { quality?: number; progressive?: boolean }): Sharp;
    png(options?: { quality?: number }): Sharp;
    webp(options?: { quality?: number }): Sharp;
    metadata(): Promise<{ width?: number; height?: number; format?: string }>;
    toBuffer(): Promise<Uint8Array>;
    toFile(path: string): Promise<any>;
  }
  
  interface SharpStatic {
    (input: Uint8Array | Buffer | string): Sharp;
  }
  
  const sharp: SharpStatic;
  export default sharp;
}

export {};