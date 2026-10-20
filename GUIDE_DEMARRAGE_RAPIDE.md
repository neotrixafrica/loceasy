# 🚀 Guide de Démarrage Rapide - LocEasy

## Comment tester LocEasy aujourd'hui

### Option 1 : Test Local (Recommandé pour le développement)

#### 1. Cloner le projet
```bash
git clone https://github.com/neotrixafrica/loceasy.git
cd loceasy
```

#### 2. Installer les dépendances
```bash
cd client && npm install
cd ../server && npm install
```

#### 3. Configurer l'environnement

Créez un fichier `.env` à la racine du projet avec :
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=votre_secret_jwt_ici
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 4. Initialiser la base de données
```bash
cd server
npx prisma generate
npx prisma db push
```

#### 5. Démarrer les serveurs

**Terminal 1 - Serveur API :**
```bash
cd server
npm run dev
```
Serveur disponible sur : http://localhost:3001

**Terminal 2 - Client :**
```bash
cd client
npm run dev
```
Application disponible sur : http://localhost:3000

#### 6. Tester l'application

Ouvrez http://localhost:3000 dans votre navigateur.

---

### Option 2 : Test en Ligne (Via Railway)

#### 1. Déployer sur Railway

Suivez les instructions dans le README pour déployer sur Railway.

#### 2. Accéder à l'application

Une fois déployé, Railway vous fournira :
- URL du client : `https://votre-client.railway.app`
- URL du serveur : `https://votre-server.railway.app`

#### 3. Tester

Accédez à l'URL du client et testez toutes les fonctionnalités.

---

## 🧪 Scénarios de Test

### Scénario 1 : Inscription d'un nouveau locataire

1. Allez sur http://localhost:3000/register
2. Remplissez l'étape 1 :
   - Nom : "Jean Koffi"
   - Email : "jean@example.com"
   - Téléphone : "+228 90 12 34 56"
3. Cliquez sur "Suivant"
4. Remplissez l'étape 2 :
   - Mot de passe : "Password123!"
   - Rôle : "Locataire"
5. Cliquez sur "Suivant"
6. Vérifiez les informations et cliquez sur "Confirmer"
7. Vous êtes maintenant inscrit et connecté !

### Scénario 2 : Inscription d'un propriétaire

1. Déconnectez-vous
2. Allez sur http://localhost:3000/register
3. Suivez les mêmes étapes mais sélectionnez "Propriétaire" comme rôle
4. Une fois inscrit, vous verrez un bouton "Publier une annonce" dans la navigation

### Scénario 3 : Rechercher un logement

1. Connectez-vous en tant que locataire
2. Allez sur http://localhost:3000/search
3. Utilisez les filtres :
   - Ville : "Lomé"
   - Type : "Appartement"
   - Prix max : 50000
4. Cliquez sur "Appliquer"
5. Vous verrez les logements correspondants
6. Cliquez sur une carte pour voir les détails

### Scénario 4 : Créer une annonce (Propriétaire)

1. Connectez-vous en tant que propriétaire
2. Cliquez sur "Publier une annonce"
3. Étape 1 :
   - Titre : "Appartement moderne à Lomé"
   - Type : "Appartement"
   - Prix : 45000
4. Cliquez sur "Suivant"
5. Étape 2 :
   - Ville : "Lomé"
   - Quartier : "Bé"
   - Adresse : "Rue 123"
6. Cliquez sur "Suivant"
7. Étape 3 :
   - Pièces : 2
   - Superficie : 60
   - Équipements : cochez "WiFi", "Climatisation"
8. Cliquez sur "Suivant"
9. Étape 4 :
   - Upload 3-4 images
   - Règles : "Pas d'animaux"
10. Cliquez sur "Publier"
11. Votre annonce est maintenant en ligne !

### Scénario 5 : Vérifier son téléphone

1. Connectez-vous
2. Allez sur http://localhost:3000/verification
3. Étape 1 - Téléphone :
   - Entrez votre numéro : "+228 90 12 34 56"
   - Cliquez sur "Envoyer le code"
   - En développement, vous verrez le OTP dans la réponse
   - Entrez le code et cliquez sur "Vérifier"
4. Votre téléphone est maintenant vérifié !

### Scénario 6 : Vérifier son identité

1. Sur la page de vérification, passez à l'étape 2
2. Sélectionnez "Carte d'identité"
3. Cliquez sur la zone d'upload
4. Sélectionnez une image de votre pièce d'identité
5. L'image sera convertie en WebP et compressée
6. Cliquez sur "Soumettre"
7. Votre identité est maintenant en attente de vérification

### Scénario 7 : Contacter un propriétaire

1. En tant que locataire, allez sur une annonce
2. Cliquez sur "Contacter"
3. Entrez votre message
4. Cliquez sur "Envoyer"
5. Le propriétaire recevra votre message

### Scénario 8 : Réserver un logement

1. Sur une annonce, cliquez sur "Réserver"
2. Sélectionnez vos dates
3. Cliquez sur "Confirmer"
4. La réservation est envoyée au propriétaire
5. Le propriétaire peut l'accepter ou la refuser

### Scénario 9 : Gérer le statut d'un logement (Propriétaire)

1. Allez sur votre annonce
2. En haut à droite, cliquez sur le badge de statut
3. Sélectionnez un nouveau statut :
   - "Visite en cours" si des candidats visitent
   - "Réservé" si quelqu'un a réservé
   - "Loué" si le logement est occupé
4. Le statut est mis à jour automatiquement

### Scénario 10 : Signaler un logement frauduleux

1. Sur une annonce, cliquez sur "Signaler"
2. Sélectionnez une raison : "Annonce trompeuse"
3. Ajoutez une description si nécessaire
4. Cliquez sur "Soumettre"
5. Le signalement est envoyé aux administrateurs

---

## 📊 Checklist de Fonctionnalités à Tester

### ✅ Authentification
- [ ] Inscription locataire
- [ ] Inscription propriétaire
- [ ] Connexion
- [ ] Déconnexion
- [ ] Profil utilisateur

### ✅ Recherche
- [ ] Recherche par mot-clé
- [ ] Filtre par ville
- [ ] Filtre par quartier
- [ ] Filtre par type
- [ ] Filtre par prix
- [ ] Filtre par disponibilité
- [ ] Affichage grille
- [ ] Affichage carte

### ✅ Annonces
- [ ] Création d'annonce (4 étapes)
- [ ] Upload d'images
- [ ] Page de détail
- [ ] Gallery d'images
- [ ] Lightbox
- [ ] Carte interactive
- [ ] Équipements
- [ ] Badges de statut

### ✅ Interactions
- [ ] Ajouter aux favoris
- [ ] Retirer des favoris
- [ ] Liste des favoris
- [ ] Envoyer un message
- [ ] Voir les messages
- [ ] Réserver un logement
- [ ] Accepter une réservation
- [ ] Refuser une réservation

### ✅ Confiance
- [ ] Vérification téléphone
- [ ] Vérification identité
- [ ] Upload de document
- [ ] Conversion WebP
- [ ] Voir son score de confiance
- [ ] Voir les badges

### ✅ Signalements
- [ ] Signaler un logement
- [ ] Signaler un utilisateur
- [ ] Sélectionner une raison
- [ ] Ajouter une description

### ✅ Notifications
- [ ] Voir les notifications
- [ ] Marquer comme lu
- [ ] Supprimer

---

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port 3001 est libre
- Vérifiez que DATABASE_URL est correct
- Vérifiez que Prisma est généré : `npx prisma generate`

### Le client ne démarre pas
- Vérifiez que le port 3000 est libre
- Vérifiez que les dépendances sont installées
- Vérifiez que NEXT_PUBLIC_API_URL est correct

### Erreur de connexion à la base de données
- Vérifiez DATABASE_URL
- Vérifiez que Neon est accessible
- Vérifiez que le schéma est synchronisé : `npx prisma db push`

### Les images ne s'uploadent pas
- Vérifiez que l'API upload est configurée
- Vérifiez que le fichier est une image
- Vérifiez que la taille est < 10MB

---

## 📞 Support

Pour toute question ou problème :
- GitHub Issues : https://github.com/neotrixafrica/loceasy/issues
- Documentation : Voir ETAT_COMPLET_APPLICATION.md

---

## 🎯 Prochaines Étapes

Une fois que vous avez testé les fonctionnalités de base :

1. **Déployer en production** sur Railway
2. **Tester avec des utilisateurs réels**
3. **Compléter les paiements** (Pilier 5)
4. **Implémenter la réputation** (Pilier 4)
5. **Lancer officiellement** au Togo
