import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import pRetry from 'p-retry';
import { logger } from './logger.js';

interface RetryConfig {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
}

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(baseURL?: string, retryConfig?: RetryConfig) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'material3-mcp-server/1.0.0'
      }
    });

    this.retryConfig = {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 10000,
      factor: 2,
      ...retryConfig
    };

    // Add response interceptor for rate limiting
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const resetTime = error.response.headers['x-ratelimit-reset'];
          const retryAfter = error.response.headers['retry-after'];

          if (resetTime) {
            const waitTime = (parseInt(resetTime) * 1000) - Date.now();
            logger.warn(`Rate limited. Waiting ${waitTime}ms until reset`);
            const abortError: any = new Error(`Rate limited. Reset at ${new Date(parseInt(resetTime) * 1000).toISOString()}`);
            abortError.name = 'AbortError';
            throw abortError;
          }

          if (retryAfter) {
            const waitTime = parseInt(retryAfter) * 1000;
            logger.warn(`Rate limited. Waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
        throw error;
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return pRetry(
      async () => {
        try {
          logger.debug(`HTTP GET: ${url}`);
          const response = await this.axiosInstance.get<T>(url, config);
          logger.debug(`HTTP GET success: ${url} (${response.status})`);
          return response;
        } catch (error: any) {
          // Don't retry on 404 or 401
          if (error.response?.status === 404 || error.response?.status === 401) {
            const abortError: any = new Error(error.message);
            abortError.name = 'AbortError';
            throw abortError;
          }

          logger.warn(`HTTP GET failed: ${url}`, { error: error.message, attempt: error.attemptNumber });
          throw error;
        }
      },
      {
        retries: this.retryConfig.retries,
        minTimeout: this.retryConfig.minTimeout,
        maxTimeout: this.retryConfig.maxTimeout,
        factor: this.retryConfig.factor,
        onFailedAttempt: (error) => {
          logger.debug(`Retry attempt ${error.attemptNumber}/${this.retryConfig.retries} for ${url}`);
        }
      }
    );
  }

  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `token ${token}`;
  }

  setHeader(key: string, value: string) {
    this.axiosInstance.defaults.headers.common[key] = value;
  }
}

// Create singleton instances
export const githubClient = new HttpClient('https://api.github.com', {
  retries: 3,
  minTimeout: 2000,
  maxTimeout: 15000
});

// Set GitHub token if available
if (process.env.GITHUB_TOKEN) {
  githubClient.setAuthToken(process.env.GITHUB_TOKEN);
  logger.info('GitHub token configured');
}

export const webClient = new HttpClient(undefined, {
  retries: 2,
  minTimeout: 1000,
  maxTimeout: 8000
});