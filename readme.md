# OCS

Système pour gérer les fiches de personnages et les jets de dés pour [le jeu de rôle l'Œil noir](https://fr.wikipedia.org/wiki/L%27%C5%92il_noir) (version 5). Une instance est disponible sur [dark-eye.herokuapp.com](dark-eye.herokuapp.com).

Le serveur à besoin de plusieurs variables d'environement qui peuvent être définies globalement, ou dans un fichier `.env` à la racine du projet :
- `AWS_ACCESS_KEY_ID` : Clé d'accès pour la base de données DynamoDB
- `AWS_SECRET_ACCESS_KEY` : Clé secrète pour DynamoDB
- `AWS_REGION_NAME` : Région du serveur DynamoDB

Il suffit ensuite de lancer le serveur en local :

```bash
uvicorn api.main:app --reload --reload-dir api --workers 1
```

Ou sur un serveur avec la commande définie dans `Procfile`. Si le serveur est lancé sur une instance heroku, il démare automatiquement.

Outils utilisés : Vue.js pour le front-end, FastAPI (python) pour le backend, DynamoDB pour la DB, et Heroku pour le déploiement.
