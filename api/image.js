export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  // Only allow Supabase origin
  const allowedHost = 'irbbgsekymaxpvtdncpd.supabase.co';
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== allowedHost) {
      return res.status(403).send('Forbidden origin');
    }
  } catch (e) {
    return res.status(400).send('Invalid url');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send('Upstream error');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(buffer);
  } catch (err) {
    console.error('Image proxy error:', err);
    res.status(500).send('Processing error');
  }
}
