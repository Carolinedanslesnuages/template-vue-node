#!/bin/bash

#-----------------------------------------------------------------------------#
# Exemple de lancement du script, à la racine du projet lancer la commande :  #
#     sh ./ci/scripts/deploy-alpha.sh -q "2.7.0" -b "v1.2.0-alpha" -a "27"    #
#-----------------------------------------------------------------------------#

# Déclare des couleurs pour le terminal
red='\e[0;31m'
no_color='\033[0m'

# Récupère les arguments du script shell et affiche l'aide si un ou plusieurs arguments sont absents
TEXT_HELPER="Les arguments suivants sont nécessaires à la bonne exécution du script, veuillez les renseigner:

  -q    Numéro de version de la branche qualif qui va servir de base pour créer la nouvelle branche alpha (ex: '2.7.0')
  -b    Numéro de version de la base de la nouvelle branche alpha (ex: 'v1.2.0-alpha')
  -a    Numéro de version de la nouvelle branche alpha (ex: '27')


Exemple de lancement du script, à la racine du projet lancer la commande:
  sh ./ci/scripts/deploy-alpha.sh -q '2.7.0' -b 'v1.2.0-alpha' -a '27'

"
help() {
  printf "$TEXT_HELPER";
}

while getopts q:b:a:h flag
do
  case "${flag}" in
    q)
      QUALIF_VERSION=${OPTARG};;
    b)
      ALPHA_BASE=${OPTARG};;
    a)
      ALPHA_VERSION=${OPTARG};;
    h|*)
      help
      exit 0;;
  esac
done

if [ -z "$QUALIF_VERSION" ] || [ -z "$ALPHA_BASE" ] || [ -z "$ALPHA_VERSION" ]
then
  help
  exit
fi


# Récupère les informations git du projet
PROJECT_DIR="$(git rev-parse --show-toplevel)"
REMOTE_ORIGIN_URL="$(git remote get-url origin)"
cd $PROJECT_DIR

# Déclare les variables d'environnement
QUALIF_BRANCH="qualif/$QUALIF_VERSION"
ALPHA_BRANCH="alpha/$ALPHA_BASE.$ALPHA_VERSION"
DEPLOY_TRIGGER_BRANCH="feat/deploy-alpha-$ALPHA_VERSION"


# Rapatrie (pull) la branche qualif
printf "\n${red}I.${no_color} Pull de la branche '$QUALIF_BRANCH'\n"
git checkout $QUALIF_BRANCH
git pull

# Crée et se positionne sur la branche alpha
printf "\n${red}II.${no_color} Création locale de la branche '$ALPHA_BRANCH'\n"
git checkout -b $ALPHA_BRANCH

# Pousse (push) la nouvelle branche alpha vers le dépôt distant
printf "\n${red}III.${no_color} Push vers le dépôt distant de la branche '$ALPHA_BRANCH'\n"
git push -u origin $ALPHA_BRANCH

# Crée et se positionne sur la branche qui sera merge dans alpha pour déclencher le déploiement
printf "\n${red}IV.${no_color} Création et positionnement sur la branche '$DEPLOY_TRIGGER_BRANCH'\n"
git checkout -b $DEPLOY_TRIGGER_BRANCH

# Modifie la première ligne du readme pour y mettre comme titre "# APP alpha XX"
printf "\n${red}V.${no_color} Modification de la première ligne du README.md avec le numéro de version '$ALPHA_VERSION'\n"
README_FIRST_LINE="# APP alpha $ALPHA_VERSION"
sed -i.bak "1s/.*/$README_FIRST_LINE/" README.md
rm README.md.bak

# Indexe tout les changements de fichier et commit les changements
printf "\n${red}VI.${no_color} Commit des changements du README.md dans '$DEPLOY_TRIGGER_BRANCH'\n"
git add -A
git commit -m ":rocket: Deploy alpha $ALPHA_VERSION"

# Pousse (push) les commits vers le dépôt distant
printf "\n${red}VII.${no_color} Push de la branche '$DEPLOY_TRIGGER_BRANCH' vers le dépôt distant\n"
git push -u origin $DEPLOY_TRIGGER_BRANCH

printf "\n${red}VIII.${no_color} Vous pouvez désormais vous rendre sur $REMOTE_ORIGIN_URL et merge '$DEPLOY_TRIGGER_BRANCH' dans '$ALPHA_BRANCH' pour déclencher le déploiement dans dans l'environnement Alpha\n"


# Crée la PR associée au merge dans alpha (a méditer)
# gh auth login
# gh pr create --fill --base ALPHA_BRANCH
# gh pr merge --auto
