# Déploiement GitHub + Vercel — Music Hit Maker Studio

## 1. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Music Hit Maker Studio"
git branch -M main
git remote add origin https://github.com/<votre-compte>/hit-maker.git
git push -u origin main
```

> Le `.env` est ignoré par `.gitignore` : vos clés ne partent jamais sur GitHub.

## 2. Déployer sur Vercel

1. https://vercel.com → **Add New → Project** → importez le repo GitHub.
2. Framework Preset : **Other** (aucune config de build nécessaire).
3. Dans **Settings → Environment Variables**, ajoutez TOUTES les variables du `.env` :
   - `GROQ_API_KEY`, `GROQ_MODEL`
   - `SUNO_API_KEY`, `SUNO_API_BASE`, `SUNO_MODEL`
   - `UDIO_API_KEY`, `UDIO_API_BASE`, `UDIO_MODEL`
   - `HF_API_KEY` (pochette Stable Diffusion)
   - `FB_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID`
   - `INSTAGRAM_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN`
   - Optionnel : `VIDEO_MAX_DURATION` (durée max des vidéos, défaut 60s)
4. **Deploy**.

## 3. Ce qui est déjà adapté à Vercel

| Élément | Adaptation |
|---|---|
| Serveur Express | Exporté via `api/index.js` (fonction serverless) |
| Fichiers générés (audio/vidéo) | Écrits dans `/tmp` + route dynamique `/uploads/:file` |
| Multer | Stockage mémoire sur Vercel (filesystem lecture seule) |
| ffmpeg | Embarqué via `ffmpeg-static` (aucune installation) |
| Vidéos FB / Reels IG | MP4 H.264/AAC 1080x1080 généré depuis pochette + audio |

## 4. Stockage des fichiers audio (fortement recommandé)

Les requêtes serverless Vercel sont limitées à **4,5 Mo** : un MP3 complet
ne peut pas passer en envoi direct. L'app gère ça via **Vercel Blob**
(upload direct navigateur → stockage persistant) :

1. Projet Vercel → onglet **Storage** → **Create Database** → **Blob**
2. Le token `BLOB_READ_WRITE_TOKEN` est ajouté automatiquement
   aux variables d'environnement du projet.
3. Redéployez si besoin.

Avantages : fichiers jusqu'à 100 Mo, URLs publiques permanentes utilisées
comme lien d'écoute dans les posts et la page « Tracks publiés ».

Sans Blob configuré, l'envoi direct de fichier reste possible jusqu'à
~4 Mo (avec avertissement), et le mode « Lien » fonctionne normalement.

## 5. Limitations connues

- **/tmp éphémère** : les fichiers générés n'existent que pendant l'invocation
  serverless. Pour une persistance réelle des tracks publiés, connectez
  [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (`BLOB_READ_WRITE_TOKEN`)
  et remplacez `persistAudioBuffer` par un upload Blob.
- **Timeout fonction** : limité à 60s (`maxDuration`). Si l'encodage vidéo ou la
  publication Reel dépasse, passez au plan Pro (300s) ou réduisez `VIDEO_MAX_DURATION`.
- **Mode automatique désactivé** : les APIs Suno/Udio étant payantes,
  `cron_daily.js` refuse de s'exécuter sans `AUTO_ENABLED=true`, et les
  déclencheurs `schedule:` ont été retirés des workflows GitHub Actions
  (lancement manuel uniquement depuis l'onglet Actions).
- Les liens Suno/Udio doivent être des liens directs MP3 pour être téléchargés ;
  un lien de partage `suno.com/s/...` ne l'est pas (utilisez l'URL CDN retournée
  par l'API, ou téléversez le fichier MP3).
