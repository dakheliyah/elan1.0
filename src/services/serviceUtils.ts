
export class SupabaseServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseServiceError';
  }
}

export const handleSupabaseError = (error: any, operation: string): never => {
  console.error(`Supabase ${operation} error:`, error);
  throw new SupabaseServiceError(
    error.message || `Failed to ${operation}`,
    error.code,
    error.details
  );
};
