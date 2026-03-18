const CHUNK_SIZE = 3800;

const getCookie = (rawKey: string): string | null => {
  if (typeof document === "undefined") return null;
  const name = `${encodeURIComponent(rawKey)}=`;
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const c of cookies) {
    if (c.startsWith(name)) {
      return decodeURIComponent(c.substring(name.length));
    }
  }

  return null;
};

const setCookie = (rawKey: string, rawValue: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") return;
  const encodedKey = encodeURIComponent(rawKey);
  const encodedValue = encodeURIComponent(rawValue);
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${encodedKey}=${encodedValue}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure ? "; Secure" : ""}`;
};

const deleteCookie = (rawKey: string) => {
  if (typeof document === "undefined") return;
  const encodedKey = encodeURIComponent(rawKey);

  document.cookie = `${encodedKey}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${encodedKey}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
};

export const cookieStorage = {
  getItem: (key: string): string | null => {
    const chunkCountRaw = getCookie(`${key}.chunks`);
    const chunkCount = chunkCountRaw ? Number(chunkCountRaw) : NaN;

    if (!Number.isNaN(chunkCount) && chunkCount > 0) {
      let value = "";
      for (let i = 0; i < chunkCount; i++) {
        const part = getCookie(`${key}.${i}`);
        if (part === null) return null;
        value += part;
      }
      return value;
    }

    return getCookie(key);
  },

  setItem: (key: string, value: string) => {
    if (typeof document === "undefined") return;

    cookieStorage.removeItem(key);

    const maxAgeSeconds = 60 * 60 * 24 * 7;

    if (value.length <= CHUNK_SIZE) {
      setCookie(key, value, maxAgeSeconds);
      return;
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }

    setCookie(`${key}.chunks`, String(chunks.length), maxAgeSeconds);
    for (let i = 0; i < chunks.length; i++) {
      setCookie(`${key}.${i}`, chunks[i], maxAgeSeconds);
    }
  },

  removeItem: (key: string) => {
    const chunkCountRaw = getCookie(`${key}.chunks`);
    const chunkCount = chunkCountRaw ? Number(chunkCountRaw) : NaN;

    deleteCookie(key);
    deleteCookie(`${key}.chunks`);

    if (!Number.isNaN(chunkCount) && chunkCount > 0) {
      for (let i = 0; i < chunkCount; i++) {
        deleteCookie(`${key}.${i}`);
      }
    }
  },
};
