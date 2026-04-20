import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Please check your connection.';
    if (err.status >= 500) return 'The server had a problem. Please try again.';
    if (err.status >= 400) return 'The request was rejected. Please check your input.';
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
