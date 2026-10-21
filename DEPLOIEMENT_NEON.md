# 🚀 Déploiement sur Neon Serverless

## Pourquoi Neon Serverless ?

✅ **Base de données déjà sur Neon** : Pas besoin de migrations
✅ **Région Frankfurt** : Latence optimisée pour l'Afrique
✅ **Serverless** : Pas de gestion de serveur
✅ **Auto-scaling** : S'adapte automatiquement au trafic
✅ **Domaine gratuit** : `.neon.tech` inclus
✅ **Frais transparents** : Paiement à l'utilisation

---

## 📋 Prérequis

1. Compte Neon : https://console.neon.tech
2. Base de données Neon déjà créée
3. Code pushé sur GitHub : https://github.com/neotrixafrica/loceasy

---

## 🎯 Architecture de Déploiement

Nous allons déployer **2 applications Neon Serverless** :

### 1. Serveur API (Backend)
- **Root Directory** : `server`
- **Port** : 3001
- **Environment Variables** : DATABASE_URL, JWT_SECRET, etc.

### 2. Client Frontend
- **Root Directory** : `client`
- **Port** : 3000
- **Environment Variables** : NEXT_PUBLIC_API_URL

---

## 📝 Étape 1 : Préparer le projet pour Neon

### 1.1 Créer un fichier `server/neon-project.json`

```json
{
  "name": "loceasy-server",
  "version": "1.0.0",
  "main": ".next/standalone/server.js",
  "scripts": {
    "start": "node .next/standalone/server.js"
  }
}
```

### 1.2 Créer un fichier `client/neon-project.json`

```json
{
  "name": "loceasy-client",
  "version": "1.0.0",
  "main": ".next/standalone/server.js",
  "scripts": {
    "start": "node .next/standalone/server.js"
  }
}
```

### 1.3 Mettre à jour `server/package.json`

Ajouter ces scripts :
```json
{
  "scripts": {
    "build:neon": "next build",
    "start:neon": "NODE_ENV=production node .next/standalone/server.js"
  }
}
```

### 1.4 Mettre à jour `client/package.json`

Ajouter ces scripts :
```json
{
  "scripts": {
    "build:neon": "next build",
    "start:neon": "NODE_ENV=production node .next/standalone/server.js"
  }
}
```

---

## 🌐 Étape 2 : Déployer sur Neon

### 2.1 Déployer le Serveur API

1. Allez sur https://console.neon.tech
2. Sélectionnez votre projet
3. Cliquez sur **"Create Project"** ou utilisez votre projet existant
4. Cliquez sur **"Branches"** → **"Add Branch"**
5. Configurez :
   - **Name** : `loceasy-server`
   - **Git Repository** : `neotrixafrica/loceasy`
   - **Root Directory** : `server`
   - **Build Command** : `npm run build`
   - **Start Command** : `npm run start`
6. Configurez les variables d'environnement :
   - `DATABASE_URL` : (votre connection string Neon)
   - `JWT_SECRET` : `J2u2kEYS2LtFOmFq8ElZ4b5FYHtG68qT+KyyWOF/9us=`
   - `APP_SECRET` : `b5b9544b09cf806be55a8f96f91f69e35dd4f3f54e94a6b1fccb544aa6d039f76189ce1af90765b661e4d4446c72d39e`
   - `NODE_ENV` : `production`
   - `PORT` : `3001`
7. Cliquez sur **"Create Branch"**
8. Attendez le déploiement

### 2.2 Déployer le Client Frontend

1. Dans le même projet Neon
2. Cliquez sur **"Branches"** → **"Add Branch"**
3. Configurez :
   - **Name** : `loceasy-client`
   - **Git Repository** : `neotrixafrica/loceasy`
   - **Root Directory** : `client`
   - **Build Command** : `npm run build`
   - **Start Command** : `npm run start`
4. Configurez les variables d'environnement :
   - `NEXT_PUBLIC_API_URL` : (URL du serveur Neon, ex: `https://loceasy-server-xxx.neon.tech`)
   - `NODE_ENV` : `production`
   - `PORT` : `3000`
5. Cliquez sur **"Create Branch"**
6. Attendez le déploiement

---

## 🔧 Étape 3 : Configurer les Services Neon

### 3.1 Obtenir les URLs

Une fois déployé, Neon vous fournira :
- **Serveur** : `https://loceasy-server-xxx.neon.tech`
- **Client** : `https://loceasy-client-xxx.neon.tech`

### 3.2 Mettre à jour NEXT_PUBLIC_API_URL

1. Allez sur la branche `loceasy-client`
2. Cliquez sur **"Settings"** → **"Environment Variables"**
3. Mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL du serveur
4. Cliquez sur **"Save"**
5. Redéployez le client

---

## 🧪 Étape 4 : Tester le Déploiement

### 4.1 Tester le Serveur

1. Ouvrez l'URL du serveur dans votre navigateur
2. Testez : `https://loceasy-server-xxx.neon.tech/api/listings`
3. Vous devriez voir une réponse JSON avec les listings

### 4.2 Tester le Client

1. Ouvrez l'URL du client dans votre navigateur
2. Testez l'inscription
3. Testez la recherche
4. Testez toutes les fonctionnalités

---

## 📊 Monitoring Neon

### 4.1 Voir les Logs

1. Allez sur https://console.neon.tech
2. Sélectionnez votre projet
3. Cliquez sur **"Logs"**
4. Sélectionnez la branche (server ou client)
5. Voyez les logs en temps réel

### 4.2 Voir les Métriques

1. Cliquez sur **"Metrics"**
2. Voyez :
   - CPU usage
   - Memory usage
   - Request count
   - Response time

---

## 🔐 Sécurité Neon

### Variables d'Environnement

Neon sécurise automatiquement les variables d'environnement. Vos secrets sont :

✅ Stockés de manière sécurisée
✅ Jamais exposés dans les logs
✅ Cryptés au repos
✅ Accessibles uniquement par votre application

### Accès RESTRICTÉ

1. Allez sur **"Settings"** → **"Access Control"**
2. Configurez qui peut accéder au projet
3. Activez l'authentification 2FA

---

## 💰 Coûts Neon

### Gratuit
- 10 000 requêtes/mois
- 512 MB RAM
- 0.5 CPU
- 1 Go de stockage

### Pay-as-you-go
- $0.20 par 1 000 requêtes
- $0.15 par Go-heure CPU
- $0.10 par Go-mois RAM

Pour LocEasy en phase de test, le plan gratuit devrait suffire.

---

## 🎯 Domaine Personnalisé (Optionnel)

Si vous voulez un domaine personnalisé (ex: `loceasy.tg`) :

1. Allez sur **"Settings"** → **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine
4. Configurez les DNS selon les instructions Neon
5. Activez HTTPS automatique

---

## 🚨 Dépannage

### Erreur : Build failed

1. Vérifiez que les dépendances sont dans `package.json`
2. Vérifiez que le build command est correct
3. Vérifiez les logs pour voir l'erreur exacte

### Erreur : Database connection failed

1. Vérifiez que `DATABASE_URL` est correct
2. Vérifiez que la base de données Neon est active
3. Vérifiez que les régions correspondent

### Erreur : Port already in use

1. Neon Serverless gère automatiquement les ports
2. Vérifiez que vous n'avez pas hardcodé un port
3. Utilisez `process.env.PORT` dans votre code

---

## 📝 Checklist de Déploiement

### Préparation
- [ ] Code pushé sur GitHub
- [ ] Secrets régénérés
- [ ] `.env` configuré localement
- [ ] Base de données Neon active

### Déploiement Serveur
- [ ] Créer branche Neon pour le serveur
- [ ] Configurer root directory : `server`
- [ ] Configurer build command
- [ ] Configurer start command
- [ ] Ajouter variables d'environnement
- [ ] Déployer et tester

### Déploiement Client
- [ ] Créer branche Neon pour le client
- [ ] Configurer root directory : `client`
- [ ] Configurer build command
- [ ] Configurer start command
- [ ] Ajouter NEXT_PUBLIC_API_URL
- [ ] Déployer et tester

### Finalisation
- [ ] Tester l'application complète
- [ ] Vérifier les logs
- [ ] Configurer le monitoring
- [ ] Configurer le domaine personnalisé (optionnel)

---

## 🎯 Prochaines Étapes

Une fois déployé sur Neon :

1. **Tester avec des utilisateurs réels**
2. **Compléter l'UI des paiements** (Pilier 5)
3. **Implémenter le calcul de réputation** (Pilier 4)
4. **Optimiser les performances**
5. **Lancer officiellement au Togo**

---

## 📞 Support Neon

- Documentation : https://neon.tech/docs
- Community : https://community.neon.tech
- Support : https://neon.tech/support
