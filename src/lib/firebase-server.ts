type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function getDatabaseBaseUrl() {
  const url = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_FIREBASE_DATABASE_URL is missing.");
  }

  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<T | null> {
  const baseUrl = getDatabaseBaseUrl();
  const response = await fetch(`${baseUrl}/${path}.json`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Firebase request failed for ${path}: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T | null;
}

export async function firebaseGet<T>(path: string) {
  return request<T>(path, "GET");
}

export async function firebaseSet(path: string, value: unknown) {
  await request(path, "PUT", value);
}

export async function firebasePatch(path: string, value: unknown) {
  await request(path, "PATCH", value);
}

export async function firebaseDelete(path: string) {
  await request(path, "DELETE");
}

export async function firebasePush<T extends object>(
  path: string,
  value: T,
) {
  const created = await request<{ name: string }>(path, "POST", value);

  if (!created?.name) {
    throw new Error(`Firebase push failed for ${path}.`);
  }

  await firebasePatch(`${path}/${created.name}`, { id: created.name });
  return created.name;
}
