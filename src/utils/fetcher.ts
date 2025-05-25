import { UserRole } from "@/types/role";
/**
 * Utility function for fetching data from APIs with error handling
 */
export const fetcher = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  
  // Handle API errors
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach the response status code
    (error as any & { status?: number }).status = response.status;
    
    // Try to parse the error message from the response
    try {
      const errorData = await response.json();
      (error as any & { info?: unknown }).info = errorData;
      
      // Use the API's error message if available
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        error.message = (errorData as { message: string }).message;
      } else if (errorData && typeof errorData === 'object' && 'error' in errorData) {
        error.message = (errorData as { error: string }).error;
      }
    } catch {
      // If the response is not JSON, use the status text
      error.message = response.statusText;
    }
    
    throw error;
  }
  
  return response.json();
};