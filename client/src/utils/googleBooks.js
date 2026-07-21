const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://bookmarkd-production.up.railway.app"
    : "http://localhost:3001";

export async function searchBookVolumes(query, maxResults = 40) {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });
  return fetch(`${API_BASE}/api/books?${params}`);
}

export async function fetchBookVolume(googleId) {
  return fetch(`${API_BASE}/api/books/${encodeURIComponent(googleId)}`);
}
