export function normalizeHttpExceptionResponse(
  response: string | object,
): Record<string, unknown> {
  if (typeof response === 'string') {
    return { message: response };
  }

  if (typeof response === 'object' && response !== null) {
    return response as Record<string, unknown>;
  }

  return { message: 'Unknown error' };
}
