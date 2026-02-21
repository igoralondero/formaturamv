
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAX_VjK_mMIw_vYczPNkfGIlT7fAuaMBcnAkmDd5UnsiqgfUmVcso5rlBiUCvn0nXC/exec';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'valentina2026';

  // Middleware de autenticação
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    // Em serverless, o token é a própria senha
    if (authHeader === `Bearer ${ADMIN_PASSWORD}`) {
      next();
    } else {
      res.status(401).json({ error: 'Não autorizado' });
    }
  };

  // Rota de Login
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      // Retorna a senha como token (igual à função serverless)
      res.json({ token: password });
    } else {
      res.status(401).json({ error: 'Senha incorreta' });
    }
  });

  // Proxy para Google Apps Script GET (para contornar CORS) - PROTEGIDO (Lista de convidados)
  app.get("/api/guests", requireAuth, async (req, res) => {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'GET',
        redirect: 'follow'
      });

      const text = await response.text();
      
      // Tenta verificar se a resposta é JSON
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error("Erro: O Google Script retornou HTML em vez de JSON.");
        console.error("Início da resposta recebida:", text.substring(0, 200));
        
        res.status(500).json({ 
          error: "O link do Google Script retornou uma página HTML. Verifique se você configurou o acesso para 'Qualquer pessoa' (Anyone) na implantação do script.",
          preview: text.substring(0, 200)
        });
      }
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy para salvar RSVP (POST)
  app.post("/api/guests", async (req, res) => {
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
        res.json(data);
      } catch (e) {
        console.error("Erro ao parsear resposta do Google Script (POST):", text.substring(0, 200));
        res.status(500).json({ error: "Erro na resposta do Google Script" });
      }
    } catch (error: any) {
      console.error("Erro no proxy POST /api/guests:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy para buscar fotos
  app.get("/api/photos", async (req, res) => {
    try {
      const response = await fetch(`${WEB_APP_URL}?action=getPhotos`, {
        method: 'GET',
        redirect: 'follow'
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        res.status(500).json({ error: "Erro ao processar fotos da planilha" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy para adicionar foto - PROTEGIDO
  app.post("/api/photos", requireAuth, async (req, res) => {
    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req.body, action: 'addPhoto' }),
        redirect: 'follow'
      });
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
