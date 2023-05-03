### Conventions de nommage

Noms de fichiers :

- [kebab-case](https://wprock.fr/blog/conventions-nommage-programmation/#Conventions-Le-Kebab-case-ou-Spinal-case), pas de majuscules, sauf pour les fichiers de composants Vue (SFC) : [PascalCase](https://wprock.fr/blog/conventions-nommage-programmation/#Conventions-Le-Pascal-case).
- pour les fichiers de tests unitaires, chacun se trouve au même endroit que le fichier qu'il teste, avec le même nom, mais se termine toujours par `.spec.js`

### Conventions de syntaxe

Tous les fichiers doivent :

- se terminer par un LF (saut de ligne *nix) ;
- être encodé en utf-8 ;
- avoir des sauts de ligne *nix (LF)
- utiliser préférentiellement les guillemets simples, **sauf en HTML**
- avoir une indentation faite avec 2 espaces.

#### Conventions de syntaxe javascript

- [standardJS](https://standardjs.com/)
- Avec une nuance : [des virgules pour les dernières lignes](https://eslint.org/docs/rules/comma-dangle) en multilignes.

#### Conventions de syntaxe Vue

- [Vue-recommended](https://github.com/vuejs/eslint-plugin-vue/blob/v6.2.2/docs/rules/README.md#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead)

#### Conventions de syntaxe HTML

- dès qu'il y a plus d'un attribut, ils doivent chacun être sur une ligne ;
- les noms de classes doivent être séparés par 2 espaces pour améliorer la lisibilité.

### Conventions de flow git

- **`master`** est ce qui sera en prod (quand on aura un vrai environnement de prod)
- **`develop`** est ce qui sera en qualif (quand on aura un vrai environnement de qualif), et sera fusionné dans `master`
- **feat/\*** est une branche qui correspond à un ticket décrivant une fonctionnalité, et qui sera fusionnée dans `develop/*`
- **fix/\*** est une branche qui correspond à un ticket décrivant un bug, et qui sera fusionnée dans `develop/*`
- **docs/\*** est une branche qui correspond à un ticket décrivant une modification de la documentation, et qui sera fusionnée dans `develop/*`
- **tech/\*** est une branche qui correspond à un ticket décrivant une modification purement technique, et qui sera fusionnée dans `develop/*`
- **devops/\*** est une branche qui correspond à un ticket décrivant une modification de la chaîne de CI/CD, et qui sera fusionnée dans `develop/*`

## Outils recommandés

- [Visual Studio Code](https://code.visualstudio.com/Download)

Avec ces paramètres pour que Emmet fonctionne avec les fichiers `.vue` (SFC) et les styles en postcss :

```json
  "emmet.includeLanguages": {
    "vue-html": "html",
    "postcss": "css"
  },
  "emmet.syntaxProfiles": {"postcss": "css"},
  "files.associations": {
    "*.css": "postcss",
    "*.html": "html"
  },
```

Avec ces extensions :

### Extensions généralistes (HTML / JS / CSS)

- [Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
- [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
- [npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)
- [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
- [Bracket Pair Colorizer 2](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer-2)
- [indent-rainbow](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow)
- [indenticator](https://marketplace.visualstudio.com/items?itemName=SirTori.indenticator)
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Live Share](https://marketplace.visualstudio.com/items?itemName=karigari.chat)
- [JavaScript (ES6) code snippets](https://marketplace.visualstudio.com/items?itemName=xabikos.JavaScriptSnippets)
- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - avec ces paramètres à rajouter :

  ```json
    "editor.codeActionsOnSave": {
      "source.fixAll": true,
    },
    "eslint.alwaysShowStatus": true,
    "eslint.enable": true,
    "eslint.workingDirectories": [{ "mode": "auto"}],
    "eslint.validate": [
      "vue",
      "html",
      "javascript"
    ],
  ```

- [Auto Import (fork)](https://marketplace.visualstudio.com/items?itemName=NuclleaR.vscode-extension-auto-import)
- [Babel JavaScript](https://marketplace.visualstudio.com/items?itemName=mgmcdermott.vscode-language-babel)
- [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
  - avec ces paramètres :

  ```json
    "css.validate": true,
    "less.validate": true,
    "scss.validate": true,
  ```

- [Import Cost](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost) pour afficher le poids des dépendances sur chaque ligne d'import / require
- [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome) pour débugger dans Chrome mais depuis VS Code
- [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug) pour débugger dans Firefox mais depuis VS Code

### Vue and tailwindcss

- [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) indispensable pour développer en Vue.js
- [Tailwind CSS Autocomplete for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) pour avoir de l'autocomplétion des classes des tailwind même en abbréviations [Emmet](https://emmet.io/)

###  Docker

Je pense que celle-ci suffit :

- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) pour gérer tous ses containers depuis VS Code

###  Markdown (pour améliorer ce fichier, par exemple)

- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one) pour écrire plus facilement du [markdown](https://www.markdownguide.org/)
- [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) pour voir une prévisualisation du fichier markdown courant
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) pour adopter facilement les bonnes pratique de l'écriture du markdown

## Installation du projet

### Prérequis

#### Node

Installer [Node](https://nodejs.org/fr/)

#### Docker

- Pour [Mac OS](https://hub.docker.com/editions/community/docker-ce-desktop-mac)
- Pour [Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows)
- Pour Ubuntu :
  - Installation de [Docker pour Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
  - [Étapes post-installation sur Ubuntu](https://docs.docker.com/install/linux/linux-postinstall/)

### Cloner le projet

```sh
git clone https://github.com/Mainbot/template-vue-node-mongo.git
```
### Installation avec npm

#### Installer les dépendances à la racine du projet

```sh
npm install
```

#### Installer les dépendances du serveur

```sh
cd server
npm install
```

#### Créer les variables d'environnements

Créer un fichier `.env` dans le dossier `server` avec les variables correspondantes (cf. exemple du fichier `.env-example`).

idem dans le dossier client

_Pour tester l'environement dédié à l'expérimentation
dans le .env de server passez EXPERIMENTATION de false à true
dans le .env de client passez VITE_APP_EXPERIMENTATION de false à true_

#### Installer les dépendances du client

```sh
cd client
npm install
```

### Lancer la base de données (l'outil de test de mail mailhog)

Le fichier `docker-compose.dev.yml` est prêt dans le dossier `server` et il permet d'avoir à la fois un serveur mongodb et une UI en web, qui écoute sur le port `8081` (<http://localhost:8081>) et mailhog pour intercepter les mails sur le port `8025` (<http://localhost:8025>).

On peut le lancer depuis VS Code si l'extension Docker est installé en faisant un clic droit sur le fichier et `Compose Up` dans le menu qui apparaît.

On peut aussi le lancer facilement en ligne de commande :

```sh
cd server
npm run compose:up
```

### Lancer le serveur

```sh
cd server
npm run dev
```

### Lancer le client

```sh
cd client
npm start
```

### Lancer le serveur en mode test

```sh
cd server
npm run dev-ci
```

### Lancer les tests unitaires du client

```sh
cd client
npm test
```

### Lancer les tests unitaires du client en mode watch

```sh
cd client
npm run test:watch
```

### Lancer les tests end-to-end du client (Cypress)

```sh
cd client
npm run test:e2e
```

## Problèmes rencontrés

erreur serveur pour mail (notamment mailhog pour les tests)
pour un système qui accepte IPV4 et IPV6 localhost peut renvoyer 2 addresses
bien définir la variable d'environnement SMTP_HOST=127.0.0.1 (pour de l'IPV4) dans le .env
