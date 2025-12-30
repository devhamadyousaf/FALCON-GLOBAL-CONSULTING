/**
 * Async operation helpers for preventing stuck loading states
 * and improving UX with retry logic and timeouts
 */

/**
 * Creates a promise that rejects after a specified timeout
 * @param {number} ms - Timeout in milliseconds
 * @param {string} operationName - Name of the operation for error messaging
 * @returns {Promise} Promise that rejects on timeout
 */
export const createTimeoutPromise = (ms, operationName) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${operationName} timed out after ${ms}ms`)), ms)
  );
};

/**
 * Retries an async operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in ms before first retry (default: 1000)
 * @param {boolean} exponentialBackoff - Whether to use exponential backoff (default: true)
 * @returns {Promise} Result of the operation
 */
export const retryOperation = async (
  operation,
  maxRetries = 3,
  initialDelay = 1000,
  exponentialBackoff = true
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = exponentialBackoff ? initialDelay * Math.pow(2, i) : initialDelay;
      // Retry silently - only final error will be logged
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Wraps an async operation with timeout and retry logic
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in milliseconds (default: 15000)
 * @param {number} options.retries - Number of retry attempts (default: 2)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {string} options.operationName - Name for error messages (default: 'Operation')
 * @returns {Promise} Result of the operation
 */
export const executeWithRetryAndTimeout = async (
  operation,
  options = {}
) => {
  const {
    timeout = 15000,
    retries = 2,
    retryDelay = 1000,
    operationName = 'Operation'
  } = options;

  return Promise.race([
    retryOperation(operation, retries, retryDelay),
    createTimeoutPromise(timeout, operationName)
  ]);
};

/**
 * Executes multiple operations in parallel with individual timeouts
 * @param {Array<Function>} operations - Array of async functions
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout per operation in ms (default: 10000)
 * @param {number} options.retries - Retries per operation (default: 2)
 * @param {Array<string>} options.names - Names for each operation
 * @returns {Promise<Array>} Array of results from Promise.allSettled
 */
export const executeMultipleWithTimeout = async (operations, options = {}) => {
  const {
    timeout = 10000,
    retries = 2,
    names = []
  } = options;

  const wrappedOperations = operations.map((operation, index) => {
    const operationName = names[index] || `Operation ${index + 1}`;
    return executeWithRetryAndTimeout(operation, {
      timeout,
      retries,
      operationName
    });
  });

  const results = await Promise.allSettled(wrappedOperations);

  // Log results
  results.forEach((result, index) => {
    const name = names[index] || `Operation ${index + 1}`;
    if (result.status === 'rejected') {
      console.error(`❌ ${name} failed:`, result.reason);
    } else {
      console.log(`✅ ${name} succeeded`);
    }
  });

  return results;
};

/**
 * Creates a debounced version of an async function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceAsync = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Creates a throttled version of an async function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttleAsync = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
