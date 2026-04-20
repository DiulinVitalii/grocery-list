import { HttpErrorResponse } from '@angular/common/http';

import { getErrorMessage } from './get-error-message';

describe('getErrorMessage', () => {
  it('maps a status-0 HttpErrorResponse to a connectivity message', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(getErrorMessage(err)).toBe('Cannot reach the server. Please check your connection.');
  });

  it('maps a 5xx HttpErrorResponse to a server message', () => {
    const err = new HttpErrorResponse({ status: 503 });
    expect(getErrorMessage(err)).toBe('The server had a problem. Please try again.');
  });

  it('maps a 4xx HttpErrorResponse to a rejection message', () => {
    const err = new HttpErrorResponse({ status: 400 });
    expect(getErrorMessage(err)).toBe('The request was rejected. Please check your input.');
  });

  it('returns Error.message for plain errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back for unknown error shapes', () => {
    expect(getErrorMessage('not an error')).toBe('Something went wrong.');
    expect(getErrorMessage(null)).toBe('Something went wrong.');
  });

  it('respects the override fallback', () => {
    expect(getErrorMessage(null, 'custom fallback')).toBe('custom fallback');
  });
});
