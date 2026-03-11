import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../../lib/api';

describe('ApiClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Clear localStorage before each test
    localStorage.clear();

    // Reset window.location
    delete (window as Partial<Window>).location;
    window.location = { href: '' } as unknown as Location;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('request method', () => {
    // Helper to call the private request method directly with a 0ms delay for tests
    const requestDirectly = async (endpoint: string, options = {}, retries = 2, delay = 0) => {
      // We must cast to unknown then to our desired signature
      const client = apiClient as unknown as {
        request: (endpoint: string, options?: RequestInit, retries?: number, delay?: number) => Promise<unknown>
      };
      return client.request(endpoint, options, retries, delay);
    };

    it('should successfully make a request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await requestDirectly('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test-endpoint',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should attach Authorization header when auth_token exists in localStorage', async () => {
      const mockToken = 'test-token-123';
      localStorage.setItem('auth_token', mockToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
      });

      await requestDirectly('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test-endpoint',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
    });

    it('should handle response errors correctly (throw custom ApiError)', async () => {
      const mockErrorResponse = { error: 'Invalid data provided' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      });

      try {
        await requestDirectly('/test-endpoint');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        const customError = error as Error & { status?: number; response?: unknown };
        expect(customError.message).toBe('Invalid data provided');
        expect(customError.status).toBe(400);
        expect(customError.response).toEqual(mockErrorResponse);
      }
    });

    it('should handle response errors correctly when details is provided instead of error', async () => {
      const mockErrorResponse = { details: 'Validation failed' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      try {
        await requestDirectly('/test-endpoint');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        const customError = error as Error & { status?: number; response?: unknown };
        expect(customError.message).toBe('Validation failed');
        expect(customError.status).toBe(422);
        expect(customError.response).toEqual(mockErrorResponse);
      }
    });

    it('should fallback to default error message when no error details are provided', async () => {
      const mockErrorResponse = {};
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => mockErrorResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => mockErrorResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => mockErrorResponse,
        });

      try {
        await requestDirectly('/test-endpoint');
        expect(true).toBe(false);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        const customError = error as Error & { status?: number; response?: unknown };
        expect(customError.message).toBe('Request failed');
        expect(customError.status).toBe(500);
        expect(customError.response).toEqual(mockErrorResponse);
      }
    });

    it('should fallback to Network error when JSON parsing fails', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => { throw new Error('Failed to parse'); },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => { throw new Error('Failed to parse'); },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => { throw new Error('Failed to parse'); },
        });

      try {
        await requestDirectly('/test-endpoint');
        expect(true).toBe(false);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        const customError = error as Error & { status?: number; response?: unknown };
        expect(customError.message).toBe('Network error');
        expect(customError.status).toBe(503);
        expect(customError.response).toEqual({ error: 'Network error' });
      }
    });

    it('should handle 401 Unauthorized by clearing localStorage and redirecting to /login', async () => {
      localStorage.setItem('auth_token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
      localStorage.setItem('token', 'expired-token-2');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      try {
        await requestDirectly('/test-endpoint');
        expect(true).toBe(false);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        const customError = error as Error & { status?: number };
        expect(customError.message).toBe('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        expect(customError.status).toBe(401);

        // Assert localStorage is cleared
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();

        // Assert redirect
        expect(window.location.href).toBe('/login');
      }
    });

    it('should retry failed requests for 5xx errors before throwing', async () => {
      // Mock 2 failures followed by 1 success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ([]),
        });

      await requestDirectly('/test-endpoint');

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry for client errors like 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' }),
      });

      try {
        await requestDirectly('/test-endpoint');
        expect(true).toBe(false);
      } catch (error: unknown) {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const customError = error as Error & { status?: number };
        expect(customError.status).toBe(400);
      }
    });

    it('should throw fetchError if fetch completely fails multiple times', async () => {
      const networkError = new Error('Failed to fetch completely');
      mockFetch.mockRejectedValue(networkError);

      try {
        await requestDirectly('/test-endpoint');
        expect(true).toBe(false);
      } catch (error: unknown) {
        // Retries default to 2, so initial + 2 retries = 3 total calls
        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(error).toBe(networkError);
      }
    });
  });
});
