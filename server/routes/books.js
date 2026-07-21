import express from 'express';

const router = express.Router();
const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1';

function withApiKey(url) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}key=${encodeURIComponent(key)}`;
}

router.get('/', async (req, res) => {
  const { q, maxResults = '40' } = req.query;

  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Missing q parameter' });
  }

  try {
    const url = withApiKey(
      `${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(q.trim())}&maxResults=${encodeURIComponent(maxResults)}`
    );
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Google Books search error:', error);
    res.status(502).json({ error: 'Failed to fetch from Google Books' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing volume id' });
  }

  try {
    const url = withApiKey(
      `${GOOGLE_BOOKS_BASE}/volumes/${encodeURIComponent(id)}`
    );
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Google Books volume error:', error);
    res.status(502).json({ error: 'Failed to fetch from Google Books' });
  }
});

export default router;
