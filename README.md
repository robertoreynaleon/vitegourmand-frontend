# Vite & Gourmand — Front-end

Vite & Gourmand est une application web de commande de menu traiteur à domicile, basée à Bordeaux. Elle permet aux clients de consulter un catalogue de menus, de créer et suivre des commandes. Du côté professionnel, le personnel de l'entreprise dispose d'un espace staff pour gérer les commandes, modérer les avis clients, administrer le catalogue et répondre aux messages de contact. Un administrateur peut en plus gérer les comptes employés et consulter les statistiques de vente.

L'application est accessible en ligne : [vitegourmand-frontend.vercel.app](https://vitegourmand-frontend.vercel.app/)

## Découvrir l'application !

Vous pouvez d'abord consulter librement le catalogue, puis vous connecter avec l'un des profils de démonstration suivants pour parcourir les différents espaces de l'application.

**Mot de passe commun :** <code>&#36;ViteGourmand&#36;.33!</code>

### Client

- **E-mail :** `emilie.favre@yahoo.com`
- **Parcours :** ajouter un menu au panier, créer une commande, suivre son statut et déposer un avis.

### Employé

- **E-mail :** `yael.kalfa@gmail.com`
- **Parcours :** gérer les commandes, le catalogue, les avis clients et les messages de contact.

### Administrateur

- **E-mail :** `jose.garcia@gmail.com`
- **Parcours :** consulter les statistiques et gérer les comptes employés, en plus des fonctions du personnel.

Ces identifiants sont destinés à la démonstration. En local, ils sont fournis par le jeu de données importé dans MySQL au premier démarrage du back-end.

## Technologies

- React 19 et React Router pour l'interface et la navigation
- JavaScript avec des services TypeScript pour certains traitements métier comme les frais de livraison et le calcul d'une distance déterminée entre deux adresses
- Create React App / `react-scripts` pour le serveur de développement et la construction de production
- SCSS et Sass pour les styles, les variables et les mixins responsives
- Formik et Yup pour les formulaires et leur validation
- Framer Motion pour certaines animations et Recharts pour les graphiques de l'espace administrateur
- API REST Symfony consommée avec `fetch` et Axios
- Docker Compose sous WSL2 pour un environnement de développement reproductible

Ce dépôt contient l'interface React.
L'API Symfony, les bases de données et le service d'e-mails sont disponibles dans le dépôt [vitegourmand-back-end](https://github.com/robertoreynaleon/vitegourmand-back-end).
La documentation du projet est centralisée dans le dossier `DOCUMENTATION APP/` du dépôt back-end. Elle rassemble les documents de conception, le manuel d'utilisation, la documentation technique, la gestion des tâches, ainsi que le modèle de données et les diagrammes de l'application.

## Développer en local avec Docker

> Cette procédure est prévue pour la branche `main`. Elle nécessite Docker Engine et le plugin Docker Compose installés dans WSL2. Docker Desktop, Node.js et npm ne sont pas nécessaires sur la machine hôte.

### 1. Cloner le dépôt

Depuis un terminal WSL, clonez le dépôt :

```bash
git clone git@github.com:robertoreynaleon/vitegourmand-frontend.git
cd vitegourmand-frontend
```

Pour cloner avec HTTPS, remplacez l'URL SSH par :

```bash
git clone https://github.com/robertoreynaleon/vitegourmand-frontend.git
```

### 2. Démarrer le conteneur React

Construisez l'image Node et démarrez le serveur de développement :

```bash
docker compose up --build -d
```

L'application est disponible sur l'adresse locale associée au port choisi pour le front-end, par exemple `http://localhost:<port-front-end>`. Le code source est monté dans le conteneur : les modifications effectuées dans `src/` déclenchent donc le rechargement automatique de React.

Vérifiez l'état du service :

```bash
docker compose ps
```

### 3. Connecter le front-end à l'API locale

Chaque utilisateur travaille sur sa propre machine : `localhost` désigne donc toujours sa machine locale. Il faut surtout choisir des ports non utilisés par un autre projet. Configurez l'URL de l'API avec la variable `VG_BACKEND_URL`, au format suivant :

```text
http://localhost:<port-back-end>
```

Démarrez le dépôt [vitegourmand-back-end](https://github.com/robertoreynaleon/vitegourmand-back-end) dans un second terminal WSL, en choisissant un port libre pour l'API :

```bash
git clone git@github.com:robertoreynaleon/vitegourmand-back-end.git
cd vitegourmand-back-end
VG_BACKEND_PORT=<port-back-end> docker compose up --build -d
```

Le back-end lance les services nécessaires à l'application complète : Symfony, MySQL, phpMyAdmin, MongoDB et Mailpit. Consultez son README pour les adresses et les identifiants de développement.

### 4. Choisir les ports locaux

L'URL de l'API et le port du front-end sont fournis au conteneur par des variables d'environnement. Remplacez les valeurs entre chevrons par des ports disponibles sur votre machine :

```bash
VG_FRONTEND_PORT=<port-front-end> \
VG_BACKEND_URL=http://localhost:<port-back-end> \
docker compose up --build -d
```

L'application est ensuite accessible à l'adresse `http://localhost:<port-front-end>`. Les ports proposés par défaut dans les fichiers Compose peuvent être conservés s'ils sont libres.

### Commandes utiles

```bash
# Suivre les journaux du serveur React
docker compose logs -f frontend

# Ouvrir un terminal dans le conteneur
docker compose exec frontend sh

# Construire la version de production
docker compose exec frontend npm run build

# Lancer les tests React
docker compose exec frontend npm test

# Arrêter le conteneur en conservant node_modules
docker compose down

# Réinstaller les dépendances après une modification de package-lock.json
docker compose build --no-cache frontend
docker compose up -d
```

Le dossier `node_modules` est conservé dans un volume Docker Linux. Il reste ainsi séparé des dépendances éventuellement présentes sur Windows ou dans WSL.

## Organisation du code

```text
src/
├── components/  # Composants réutilisables : navigation, notifications, champs de date et d'heure
├── context/     # Authentification JWT et notifications globales
├── pages/       # Pages publiques, client, personnel et administration
├── services/    # Appels API et calculs métier côté interface
└── styles/      # Variables, mixins et styles communs SCSS
```

Les accès aux pages sont protégés selon le rôle de l'utilisateur grâce aux composants `PrivateRoute`, `StaffRoute` et `AdminRoute`. Le jeton JWT obtenu à la connexion est transmis à l'API pour les opérations nécessitant une authentification.
