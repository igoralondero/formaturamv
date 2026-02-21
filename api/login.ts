import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'valentina2026';

  if (password === ADMIN_PASSWORD) {
    // Em serverless, não mantemos estado, então o "token" será a própria senha
    // (em um app real usaríamos JWT, mas para este caso simples funciona bem via HTTPS)
    res.status(200).json({ token: password });
  } else {
    res.status(401).json({ error: 'Senha incorreta' });
  }
}
