const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/v1`;

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export interface ApiAuthResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function apiLogin(email: string, password: string): Promise<ApiAuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<ApiAuthResponse>(res);
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<ApiAuthResponse> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<ApiAuthResponse>(res);
}

export async function apiLogout(token: string): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiMe(token: string): Promise<ApiUser> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ApiUser>(res);
}
