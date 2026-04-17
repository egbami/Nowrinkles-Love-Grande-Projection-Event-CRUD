# 🚀 Setup — La Grande Projection (Nowrinkles Love)

## 1. Créer le projet Next.js

```bash
npx create-next-app@latest nowrinkles-inscription \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd nowrinkles-inscription
```

## 2. Installer les dépendances

```bash
npm install gsap @studio-freight/lenis three @types/three \
  @prisma/client prisma \
  @supabase/supabase-js \
  react-hook-form \
  react-hot-toast \
  framer-motion
```

## 3. Initialiser Prisma

```bash
npx prisma init
```

## 4. Copier tous les fichiers de ce projet dans le dossier

Remplace les fichiers générés par ceux fournis dans ce ZIP.

## 5. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
# Puis remplis les valeurs Supabase dans .env.local
```

## 6. Variables à remplir dans .env.local

Va sur https://supabase.com → ton projet → Settings → Database
- DATABASE_URL  → Connection string (mode: Session, port 5432)
- DIRECT_URL    → Connection string (mode: Direct)

Va sur Settings → API :
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY (service_role key)

## 7. Pousser le schéma en base

```bash
npx prisma db push
```

## 8. Placer le logo

Copie le fichier logo (fond transparent) dans :
  public/logo.png

## 9. Lancer en local

```bash
npm run dev
```

## 10. Déployer sur Vercel

```bash
npx vercel --prod
# Puis ajouter les variables d'env dans le dashboard Vercel
```
