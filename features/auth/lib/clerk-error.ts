type AnyError = unknown;

export function clerkErrorMessage(err: AnyError): string {
  if (!err) return 'Something went wrong. Please try again.';

  if (typeof err === 'string') return err;

  if (typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const candidates = [e.longMessage, e.message, e.code];
    for (const c of candidates) {
      if (typeof c === 'string' && c.length > 0) return c;
    }

    const errors = e.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0] as Record<string, unknown>;
      const inner = [first.longMessage, first.message, first.code].find(
        (v) => typeof v === 'string' && (v as string).length > 0,
      );
      if (typeof inner === 'string') return inner;
    }
  }

  return 'Something went wrong. Please try again.';
}
