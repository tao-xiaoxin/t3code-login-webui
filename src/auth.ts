export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "PROTOCOL_ERROR"
  | "NETWORK_ERROR"
  | "SERVER_ERROR";

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

type AuthResult = Record<string, unknown>;

function safeDestination(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return false;
  }
  return (
    !/[\\\u0000-\u0020\u007f]/.test(decoded) &&
    !decoded.startsWith("//") &&
    !/^\/(login|logout|api\/v1\/auth)([/?#]|$)/.test(decoded)
  );
}

async function parseJson(response: Response): Promise<AuthResult> {
  if (response.status === 401) throw new AuthError("INVALID_CREDENTIALS");
  if (response.status === 429) throw new AuthError("RATE_LIMITED");
  if (response.status === 403) throw new AuthError("FORBIDDEN");
  if (!response.ok) throw new AuthError("SERVER_ERROR");
  const value: unknown = await response.json().catch(() => {
    throw new AuthError("PROTOCOL_ERROR");
  });
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AuthError("PROTOCOL_ERROR");
  }
  return value as AuthResult;
}

export async function signIn(username: string, password: string, next: string): Promise<string> {
  try {
    const csrfResult = await parseJson(
      await fetch("/api/v1/auth/csrf", {
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      }),
    );
    const csrfToken = csrfResult.csrfToken;
    if (typeof csrfToken !== "string" || !csrfToken) throw new AuthError("PROTOCOL_ERROR");

    const destination = safeDestination(next) ? next : "/";
    const response = await fetch("/api/v1/auth/sessions", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        "X-T3Code-Login": `${username}:${password}`,
      },
      body: JSON.stringify({ username, password, next: destination, csrf: csrfToken }),
      signal: AbortSignal.timeout(15_000),
    });
    const result = await parseJson(response);
    const redirectTo = result.redirectTo;
    if (response.status !== 201 || !safeDestination(redirectTo)) {
      throw new AuthError("PROTOCOL_ERROR");
    }
    return redirectTo;
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("NETWORK_ERROR");
  }
}
