//@ts-check
/**
 * @template T - generic type parameter for the return value of the function
 * @param {() => Promise<T>} fn - function that returns a promise
 * @returns  {Promise<{type: 'success', data: T} | {type: 'error', message: string }>} - tuple with result and error
 */ 
export async function tryCatch(fn) {
  try {
    return { type: 'success', data: await fn() };
  } catch (error) {
    if (error instanceof Error) return { type: 'error', message: error.message };
    return { type: 'error', message: 'Unknown error occurred' };
  }
}

/**
 * Shortens a string to a specified maximum length, appending an ellipsis if necessary.
 * @param {string} str - The string to shorten.
 * @param {number} maxLength - The maximum length of the string.
 * @returns {string} - The shortened string.
 */
export function shortenString(str, maxLength) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + str.substring(str.lastIndexOf('.'));
}