import type { VercelRequest, VercelResponse } from '@vercel/node';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAX_VjK_mMIw_vYczPNkfGIlT7fAuaMBcnAkmDd5UnsiqgfUmVcso5rlBiUCvn0nXC/exec';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'valentina2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${WEB_APP_URL}?action=getPhotos`, {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(500).json({ error: "Erro ao processar fotos da planilha" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    // Autenticação necessária apenas para POST (upload)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req.body, action: 'addPhoto' }),
        redirect: 'follow'
      });
      res.status(200).json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
