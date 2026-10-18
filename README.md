# LocEasy - Plateforme de recherche de logement africaine

LocEasy est une infrastructure de confiance pour l'immobilier africain, initialement focalisée sur le Togo et conçue pour s'étendre à travers l'Afrique.

## 🏗️ Architecture

Le projet est composé de deux applications Next.js :

- **Client** (port 3000) : Interface utilisateur React/Next.js
- **Server** (port 3001) : API REST avec Prisma et PostgreSQL

## 🚀 Démarrage local

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Neon PostgreSQL

### Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/ghostorchid0/loceasy.git
cd loceasy
```

2. Installer les dépendances :
```bash
cd client && npm install
cd ../server && npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Éditez `.env` avec vos configurations :
- `DATABASE_URL` : Connection string Neon PostgreSQL
- `JWT_SECRET` : Secret pour les tokens JWT
- `NEXT_PUBLIC_API_URL` : URL de l'API serveur

4. Initialiser la base de données :
```bash
cd server
npx prisma generate
npx prisma db push
```

5. Démarrer les applications :

**Terminal 1 - Serveur :**
```bash
cd server
npm run dev
```

**Terminal 2 - Client :**
```bash
cd client
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 🌐 Déploiement

### Option 1 : Vercel (Recommandé pour le client)

1. Installer Vercel CLI :
```bash
npm i -g vercel
```

2. Déployer le client :
```bash
cd client
vercel
```

3. Configurer les variables d'environnement dans le dashboard Vercel

### Option 2 : Railway (Tout-en-un)

Railway peut héberger le client, le serveur et la base de données :

1. Créer un compte sur https://railway.app
2. Importer le dépôt GitHub
3. Railway détectera automatiquement les applications
4. Configurer les variables d'environnement

### Option 3 : Render (Gratuit)

1. Créer un compte sur https://render.com
2. Connecter le dépôt GitHub
3. Créer deux services Web :
   - Client (Build command: `cd client && npm run build`)
   - Server (Build command: `cd server && npm run build`)

## 📊 Fonctionnalités

### Pilier 1 - Confiance
- ✅ Vérification téléphone (OTP)
- ✅ Vérification identité (documents)
- ✅ Badges de confiance
- ✅ Score de confiance

### Pilier 2 - Lutte contre les fraudes
- ✅ Système de signalement
- ✅ Administration des signalements
- ✅ Actions automatiques (pénalités)

### Pilier 3 - Disponibilité en temps réel
- ✅ 4 statuts détaillés
- ✅ Gestion manuelle par propriétaire
- ✅ Badges visuels

### Pilier 4 - Réputation (En cours)
- ⏳ Calcul automatique des métriques

### Pilier 5 - Réservation sécurisée (À faire)
- ⏳ Intégration Mobile Money

## 🛠️ Technologies

- **Frontend** : Next.js 16, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL (Neon)
- **Authentification** : JWT avec cookies
- **Upload** : Conversion WebP avec compression
- **SMS** : Intégration SMS pour OTP

## 📝 Licence

MIT
