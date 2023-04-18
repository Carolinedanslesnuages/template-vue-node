# Tester le bon fonctionnement de la CI localement sur sa machine

## Prérequis

Télécharger et installer [act](https://github.com/nektos/act) sur votre machine.

```shell
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

_**Notes:**_ Si cette installation n'est pas effectuée au préalable, le premier lancement de act (cf. plus bas) demandera à l'utilisateur s'il accepte l'installation de act.

## Structure

La structure du dossier `act/` se présente comme suit :

```txt
act
├── artifacts (dossier contenant les artefacts générés si des artefacts ont été upload lors de tests)
│   └── <date_du_run> (éventuellement)
│       ├── cypress-screenshots (éventuellement)
│       └── vulnerability-report (éventuellement)
├── docker
│   └── Dockerfile (Dockerfile utilisé comme runner par act)
├── events (dossier contenant les informations de l'évènement qui déclenchera la CI)
│   └── ...
├── scripts
│   └── run-ci-locally.sh (script rattaché au `npm run test:ci` de la racine du projet. Il sert à démarrer act et récupérer les artefacts)
├── test-ci.md
└── workflows (dossier contenant)
    └── ...
```

Points d'attention :

- Le dossier `events/` contient les différents [payload](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads) utlisé pour déclencher la CI, il est nécessaire de rajouter d'éventuels évènements si cela parait nécessaire puis de les adjoindre au script à l'aide d'un drapeau.
- Le dossier `workflows/` contient une copie presque parfaite des workflows utilisés par Github dans `<root_project>/.github/workflows`. La différences entre les workflows réside dans les options non utilisable avec act ou non nécessaire à tester (ex: déploiement).

## Tester la CI

Se rendre à la racine du projet.

```shell
cd `git rev-parse --show-toplevel`
```

Lancer act.

```shell
npm run test:ci
```

Lancer act en spécifiant un fichier d'event à utiliser.

```shell
npm run test:ci -- --event 'pull_request_draft.json'
# ou
npm run test:ci -- -e 'pull_request_draft.json'
```

_**Notes:**_ Il est possible d'afficher l'aide du script en utilisant la commande `npm run test:ci -- --help` ou `npm run test:ci -- -h`

## Analyse du résultat

Après que la CI ait fini de tourner localement, les artefacts sont disponibles dans le dossier `app/ci/act/artifacts/` sous la forme d'un dossier `<date_du_run_local>`. Ce dossier peut contenir :

- Un dossier `cypress-screenshots/` qui contient les éventuelles captures d'écran réalisées par Cypress si des tests e2e ont échoués.
- Un dossier `vulnerability-report/` qui contient les artefacts liés aux scans de sécurité.

## TODO

- Améliorer l'image docker (plus légère ? plus de sécurité avec la déclaration d'un USER)
- Ajouter aux artefacts e2e les logs de l'api + renommer les screenshots avec le timestamp de fail (pour matcher avec les timestamps des logs)
