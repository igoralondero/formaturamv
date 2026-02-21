# Site de Formatura - Maria Valentina

Este é o site oficial para a formatura de Maria Valentina, desenvolvido com React, TypeScript, Vite e Tailwind CSS. O backend utiliza Google Apps Script para gerenciar confirmações de presença (RSVP) e galeria de fotos.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion (animações).
- **Backend:** Node.js (Express) como proxy para contornar CORS e autenticação simples.
- **Banco de Dados:** Google Sheets (via Google Apps Script).

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- NPM ou Yarn

## 🛠️ Instalação e Configuração

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/igoralondero/formaturamariavalentina.git
    cd formaturamariavalentina
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`) e defina a senha de administrador:

    ```env
    ADMIN_PASSWORD=sua_senha_secreta_aqui
    ```

    > **Nota:** O arquivo `.env` não deve ser commitado no GitHub por segurança.

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

    O site estará disponível em `http://localhost:3000`.

## ⚙️ Configuração do Google Apps Script (Backend)

O site se comunica com uma planilha do Google Sheets para salvar os dados.

1.  Crie uma nova planilha no Google Sheets.
2.  Vá em **Extensões > Apps Script**.
3.  Copie o código do script (não incluído neste repositório, mas deve conter as funções `doGet` e `doPost` para manipular a planilha).
4.  Implante o script como uma aplicação web:
    -   **Executar como:** Eu (seu email).
    -   **Quem tem acesso:** Qualquer pessoa (Anyone).
5.  Copie a URL do script gerado e atualize a constante `WEB_APP_URL` no arquivo `server.ts` (ou mova para uma variável de ambiente se preferir).

## 🔒 Painel Administrativo

O site possui um painel administrativo protegido por senha para visualizar a lista de convidados e gerenciar a galeria de fotos.

-   Acesse clicando no ícone de "cadeado" ou através de um link específico (se configurado).
-   A senha padrão é definida na variável `ADMIN_PASSWORD`.

## 📦 Build para Produção

Para gerar a versão otimizada para produção:

```bash
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist`.

## 📝 Licença

Este projeto é de uso pessoal para o evento de formatura.
