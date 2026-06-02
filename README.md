# Raiz

Seu ERP pessoal de autocuidado. Um espaco pra cuidar de voce, uma area de cada vez.

Construido em React + TypeScript + Vite + Tailwind, com Supabase no backend (igual o jeito que voce ja conhece do MOVARE).

## Os 6 pilares

1. **Corpo** | saude, medicos, academia e exercicios, alimentacao, beleza
2. **Mente e Espirito** | saude mental, religiao e espiritualidade, leitura reflexiva
3. **Casa** | organizacao, limpeza, mercado e estoque
4. **Financas e Metas** | metas financeiras, metas pessoais
5. **Crescimento** | educacao, sonhos
6. **Prazeres** | hobbies, series e filmes, leitura por prazer

A tela inicial tem o check-in de humor do dia e o acesso rapido a cada pilar. As paginas de cada pilar ainda estao vazias de proposito: vamos montar uma a uma, do seu jeito.

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha com os dados do seu Supabase
npm run dev
```

## Configurar o Supabase

1. Crie um projeto em supabase.com
2. Em **Project Settings > API**, copie a `Project URL` e a `anon public key` pro seu `.env`
3. Em **SQL Editor**, cole e rode o conteudo de `supabase/schema.sql`
4. Em **Authentication > Providers**, deixe o **Email** ativo (o acesso e por link magico, sem senha)
5. Em **Authentication > URL Configuration**, adicione a URL do seu site (local e a do Vercel) nas Redirect URLs

## Deploy no Vercel

1. Suba o projeto pro GitHub
2. No Vercel, importe o repositorio (framework: Vite)
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Deploy. Pronto, acessa no celular tambem.

> Dica: adicione o site a tela inicial do celular pra abrir como um app.
