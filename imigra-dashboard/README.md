# 🛫 ImigraContas — Dashboard de Gastos 🇧🇷 → 🇪🇸

Dashboard colaborativo em tempo real para controlar todos os gastos da imigração Brasil → Espanha (2 adultos + 1 cachorro 🐕).

## ✨ Funcionalidades

- 📊 **Dashboard** com KPIs, totais por fase e por pessoa
- 📋 **Tabela de gastos** com filtros por fase, categoria, cachorro e busca
- 📈 **Gráficos** de pizza, barras e linha temporal
- 🔴 **Presença ao vivo** — veja quem está online em tempo real
- 🔔 **Notificações** quando o cônjuge adiciona um gasto
- 🐕 **Filtro cachorro** — separe os gastos do pet
- 💰 **Múltiplas moedas** — R$ e € na mesma interface
- 📱 **Responsivo** — funciona no celular

## 🚀 Como fazer o deploy

### 1. Criar banco no Supabase (grátis)

1. Acesse [app.supabase.com](https://app.supabase.com) e crie um projeto
2. Vá em **SQL Editor** e cole todo o conteúdo de `supabase-migration.sql`
3. Execute o SQL (cria todas as tabelas, categorias e configurações)
4. Vá em **Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Deploy na Vercel

1. Faça upload desse projeto no GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repositório
3. Em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL = sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_anon_key
   ```
4. Clique em **Deploy** ✅

### 3. Criar contas

1. Acesse a URL da Vercel
2. **Você** cria uma conta com seu e-mail
3. **Sua esposa** cria uma conta com o e-mail dela
4. Ambos veem todos os gastos em tempo real! 🎉

## 🗂 Fases da Imigração

| Fase | Descrição |
|------|-----------|
| 🔵 Pré-Viagem | Documentação, passagens, preparativos no Brasil |
| 🟡 Durante Viagem | Gastos durante o trajeto |
| 🟣 Chegada | Primeiros dias na Espanha |
| 🟢 Pós-Chegada | Moradia, regularização, adaptação |

## 📦 Categorias Incluídas

✈️ Passagens · 🏠 Hospedagem · 🍽️ Alimentação · 📄 Documentação · 🐕 Pet · 💊 Saúde · 🚗 Transporte · 📦 Bagagem · 👕 Roupas · 💻 Eletrônicos · 🏛️ Taxas Consulado · 📚 Cursos · 🛡️ Seguro · 🏙️ Moradia Espanha · 💰 Outros

## 🔧 Desenvolvimento local

```bash
cp .env.local.example .env.local
# Edite .env.local com suas credenciais Supabase

npm install
npm run dev
```

Acesse `http://localhost:3000`

## 🛠 Stack Tecnológica

- **Next.js 14** (App Router) — Framework React
- **Supabase** — PostgreSQL + Realtime + Auth
- **Tailwind CSS** — Estilização
- **Recharts** — Gráficos
- **Vercel** — Deploy
