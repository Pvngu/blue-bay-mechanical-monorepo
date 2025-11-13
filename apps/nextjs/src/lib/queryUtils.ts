/**
 * Converts a JS object into a query string for Spatie/Laravel.
 * { filter: { status: ['todo', 'in-progress'] } }
 * becomes: "filter[status]=todo,in-progress"
 * * { filter: { nombre: 'Juan' } }
 * becomes: "filter[nombre]=Juan"
 */
export function objectToQueryString(obj: any, prefix?: string): string {
  const parts: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const k = prefix ? `${prefix}[${key}]` : key;
      const v = obj[key];

      // Ignore null, undefined or empty string values
      if (v === null || v === undefined || v === '') {
        continue;
      }

      if (typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        // Recurse for nested objects (e.g. 'filter')
        parts.push(objectToQueryString(v, k));
      } else if (Array.isArray(v)) {
        // If it's an array, join with commas (as Spatie expects)
        if (v.length > 0) {
          parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v.join(','))}`);
        }
      } else {
        // Primitive values
        parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      }
    }
  }
  return parts.filter(Boolean).join('&');
}