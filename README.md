# 💪 Séance Sport DESQUITE — PWA

Application Progressive Web App de programme musculation 4 jours/semaine.

## 🚀 Déploiement sur Vercel

### Option A — Via GitHub (recommandé)

1. **Crée un repo GitHub** (public ou privé)
2. **Pousse le projet** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TON_USER/muscu-pwa.git
   git push -u origin main
   ```
3. **Va sur [vercel.com](https://vercel.com)** → "New Project" → importe le repo → **Deploy** ✅

### Option B — Via Vercel CLI

```bash
npm install -g vercel
npm install
vercel --prod
```

## 🛠 Développement local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

## 📱 Installer comme app (PWA)

- **iOS Safari** : bouton Partager → "Sur l'écran d'accueil"
- **Android Chrome** : menu ⋮ → "Ajouter à l'écran d'accueil"
- **Desktop Chrome** : icône ⊕ dans la barre d'adresse

## ✨ Fonctionnalités

- ✅ 4 jours d'entraînement complets (Poitrine, Abdos, Biceps, Full Body)
- ✅ Cochage des exercices avec sauvegarde locale
- ✅ Barre de progression globale et par jour
- ✅ Planning semaine interactif
- ✅ Conseils nutrition et récupération
- ✅ Installable sur mobile (PWA)
- ✅ Fonctionne hors ligne (Service Worker)
