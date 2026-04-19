import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;

  if (!targetPath) {
    return res.status(400).json({ error: 'Missing path' });
  }

  const apiKey = process.env.NV_API_KEY;
  if (!apiKey) {
    console.error('NV_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Internal Server Error: API Key not configured' });
  }

  const url = `https://integrate.api.nvidia.com/${targetPath}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying request to NVIDIA:', error);
    res.status(500).json({ error: 'Failed to proxy request' });
  }
}
