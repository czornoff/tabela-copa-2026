# Copa do Mundo 2026 — PWA

App em **`/tabela-copa-2026`** — autenticação **própria** (sem Supabase).

| Ambiente | URL |
|----------|-----|
| Local | http://localhost:3000/tabela-copa-2026 |
| Produção | https://mandebem.com/tabela-copa-2026 |

## Autenticação

- **Google OAuth** → retorna para `/tabela-copa-2026/callback/google` (só Google + seu app)
- **E-mail/senha** → usuários em `data/users.json` (local, gitignored)

## `.env.local`

```env
AUTH_SECRET=um-segredo-longo-minimo-16-caracteres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=/tabela-copa-2026
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Gere o segredo: `openssl rand -base64 32`

### Google Cloud Console

**URIs de redirecionamento:**

- `http://localhost:3000/tabela-copa-2026/callback/google`
- `https://mandebem.com/tabela-copa-2026/callback/google`

**Origens JavaScript:** `http://localhost:3000` e `https://mandebem.com`

## Desenvolvimento

```bash
npm run dev
```

Abra: http://localhost:3000/tabela-copa-2026
