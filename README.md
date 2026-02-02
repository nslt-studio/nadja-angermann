# Nadja Angermann

Site web pour Nadja Angermann

## 🚀 Développement

### Démarrer l'environnement de développement

```bash
./start-dev.sh
```

Ce script va :
- Démarrer un serveur local sur le port 8000
- Créer un tunnel public via serveo.net
- Surveiller les modifications de `main.js`
- Afficher l'URL publique à utiliser dans Webflow

### Workflow

1. Modifiez `main.js` dans VS Code
2. Sauvegardez avec **Cmd+S**
3. Rechargez votre page Webflow
4. Les changements sont instantanés !

## 📁 Structure

```
nadja-angermann/
├── main.js           # Script principal du site
├── dev-server.py     # Serveur de développement
├── start-dev.sh      # Script de démarrage
└── README.md         # Ce fichier
```

## 🔗 Liens

- Repository: https://github.com/nslt-studio/nadja-angermann
- Production: Via jsDelivr CDN
  ```
  https://cdn.jsdelivr.net/gh/nslt-studio/nadja-angermann@main/main.js
  ```