import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("api-routes");

/**
 * Simple wrapper for API routes to add basic performance monitoring
 */
export function withPerformanceLogging(routeName: string, handler: Function) {
  return async (...args: any[]) => {
    return tracer.startActiveSpan(`API ${routeName}`, async (span) => {
      const startTime = performance.now();

      try {
        // Execute the original handler
        const result = await handler(...args);

        // Log performance metrics
        const duration = performance.now() - startTime;
        console.log(`[${routeName}] Completed in ${duration.toFixed(2)}ms`);

        return result;
      } catch (error) {
        // Log errors
        console.error(`[${routeName}] Error:`, error);
        throw error;
      } finally {
        // End the span
        span.end();
      }
    });
  };
}
