# Chimera Waitlist App

Application simple de waitlist avec HTML/CSS/JS et Node.js + Express + Nodemailer.

## 🚀 Features

- ✅ Page d'accueil moderne et responsive
- ✅ Formulaire d'inscription à la waitlist
- ✅ Envoi d'emails de confirmation avec nodemailer
- ✅ Stockage des emails dans un fichier JSON
- ✅ Compteur en temps réel des inscrits
- ✅ Position dans la waitlist
- ✅ Animation confetti lors de l'inscription
- ✅ Design moderne avec gradient et glassmorphism

## 📋 Prérequis

- Node.js v14 ou supérieur
- Un compte email (Gmail recommandé)

## 🛠️ Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer l'email**

Copier le fichier `.env.example` en `.env`:
```bash
cp .env.example .env
```

Éditer `.env` avec vos informations:
```env
PORT=3001
APP_NAME=Chimera
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
```

### Configuration Gmail

1. Activer l'authentification à 2 facteurs sur votre compte Google
2. Générer un mot de passe d'application: https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `EMAIL_PASS`

## 🏃 Lancement

```bash
npm start
```

L'application sera accessible sur `http://localhost:3001`

## 📁 Structure du projet

```
waitlist-app/
├── public/
│   ├── index.html      # Page d'accueil
│   ├── style.css       # Styles
│   └── script.js       # JavaScript frontend
├── data/
│   └── waitlist.json   # Base de données (créée automatiquement)
├── server.js           # Serveur Express + Nodemailer
├── .env                # Configuration (à créer)
├── .env.example        # Template de configuration
├── package.json        # Dépendances
└── README.md
```

## 🔌 API Endpoints

### POST `/api/waitlist`
Ajouter un email à la waitlist

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe" // optionnel
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inscription réussie !",
  "position": 42
}
```

### GET `/api/waitlist/count`
Obtenir le nombre total d'inscrits

**Response:**
```json
{
  "success": true,
  "count": 42
}
```

### GET `/api/waitlist/all`
Obtenir toute la waitlist (à protéger en production)

**Response:**
```json
{
  "success": true,
  "waitlist": [
    {
      "email": "user@example.com",
      "name": "John Doe",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "position": 1
    }
  ]
}
```

## 🎨 Personnalisation

### Changer le nom de l'app
Modifier `APP_NAME` dans le fichier `.env`

### Modifier les couleurs
Éditer `public/style.css` - chercher les gradients:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modifier le template d'email
Éditer le HTML dans `server.js` (fonction `transporter.sendMail`)

## 🔒 Sécurité en Production

Avant de déployer en production:

1. **Protéger l'endpoint `/api/waitlist/all`** avec une authentification
2. **Ajouter un rate limiting** pour éviter le spam
3. **Utiliser HTTPS**
4. **Valider et nettoyer les inputs**
5. **Utiliser une vraie base de données** (MongoDB, PostgreSQL, etc.)
6. **Ajouter un CAPTCHA** (Google reCAPTCHA, hCaptcha, etc.)

## 📦 Déploiement

### Vercel / Netlify
Pour déployer sur Vercel ou Netlify, vous devrez adapter le code pour utiliser les serverless functions.

### VPS / Cloud
1. Upload du code sur le serveur
2. Installer les dépendances: `npm install`
3. Configurer le `.env`
4. Utiliser PM2 pour gérer le processus:
```bash
npm install -g pm2
pm2 start server.js --name waitlist-app
pm2 startup
pm2 save
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 📧 Services Email alternatifs

Au lieu de Gmail, vous pouvez utiliser:

- **SendGrid**: Service dédié pour transactionnel
- **Mailgun**: API email puissante
- **Amazon SES**: Service AWS
- **Outlook/Hotmail**: Alternative à Gmail
- **Custom SMTP**: Votre propre serveur

Voir la doc nodemailer: https://nodemailer.com/smtp/well-known/

## 🐛 Troubleshooting

**Les emails ne sont pas envoyés**
- Vérifier que `EMAIL_USER` et `EMAIL_PASS` sont corrects
- Vérifier que l'authentification 2FA est activée (Gmail)
- Vérifier que le mot de passe d'application est bien généré
- Regarder les logs du serveur pour les erreurs

**Le compteur ne s'affiche pas**
- Vérifier que le serveur est bien lancé
- Ouvrir la console du navigateur pour voir les erreurs
- Vérifier que le fichier `data/waitlist.json` est créé

## 📝 License

MIT

## 🤝 Contributing

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
