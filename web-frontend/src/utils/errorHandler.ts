import { toast } from 'sonner';

/**
 * Standardized error handler for the application.
 * Parses different error shapes (Axios, Fetch, generic Errors) 
 * and extracts a readable message to display via toast.
 */
export const handleError = (error: unknown, fallbackMessage: string = 'An unexpected error occurred.') => {
  let errorMessage = fallbackMessage;

  if (error instanceof Error) {
    // Basic JS Error
    errorMessage = error.message;
  }

  // Handle Axios-style errors where the response data contains a message
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError.response?.statusText) {
      errorMessage = axiosError.response.statusText;
    }
  }

  toast.error(errorMessage);
  
  // Optionally, log to an external service like Sentry here
  console.warn('[AppError]:', error);
  
  return errorMessage;
};
