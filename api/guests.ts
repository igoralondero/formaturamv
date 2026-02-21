import type { VercelRequest, VercelResponse } from '@vercel/node';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAX_VjK_mMIw_vYczPNkfGIlT7fAuaMBcnAkmDd5UnsiqgfUmVcso5rlBiUCvn0nXC/exec';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'valentina2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Autenticação
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method === 'GET') {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(500).json({ 
          error: "O link do Google Script retornou HTML em vez de JSON.",
          preview: text.substring(0, 200)
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        redirect: 'follow'
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(500).json({ error: "Erro na resposta do Google Script" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
