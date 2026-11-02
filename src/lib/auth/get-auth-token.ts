type GetTokenFn = (options?: { skipCache?: boolean }) => Promise<string | null>;

export async function getAuthToken(getToken: GetTokenFn): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = await getToken({ skipCache: true });

    if (token) {
      return token;
    }

    await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
  }

  return null;
}
