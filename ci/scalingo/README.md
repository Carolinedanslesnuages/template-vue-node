# Déploiement sur Scalingo

## Ce dossier

Ce dossier contient des fichiers propres au déploiement sur Scalingo :

- `.buildpacks` : Les buildpacks nécessaires pour faire tourner l'appli APP sur Scalingo :
  - node.js pour l'API
  - nginx pour les fichiers statiques
- `.slugignore` : fichier au format `.gitignore` avec les fichiers et dossiers inutiles pour la prod
- `Procfile` : fichier au format `YAML` définit les services qui seront lancés sur scalingo.
               Doit avoir au minimum le service `web:` défini.
