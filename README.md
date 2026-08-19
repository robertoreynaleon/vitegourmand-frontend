# Vite & Gourmand — Front-end

Vite & Gourmand est une application web de gestion de menus traiteur. Elle permet de consulter un catalogue de menus, de créer et suivre des commandes, et de proposer des espaces adaptés aux clients, aux employés et aux administrateurs.

L'application est accessible en ligne : [vitegourmand-frontend.vercel.app](https://vitegourmand-frontend.vercel.app/)

Ce dépôt contient l'interface React. L'API Symfony, les bases de données et le service d'e-mails sont disponibles dans le dépôt [vitegourmand-back-end](https://github.com/robertoreynaleon/vitegourmand-back-end).

## Technologies

- React 19 et React Router pour l'interface et la navigation
- JavaScript avec des services TypeScript pour certains traitements métier (`delivery.ts`, `cartCalc.ts`)
- Create React App / `react-scripts` pour le serveur de développement et la construction de production
- SCSS et Sass pour les styles, les variables et les mixins responsives
- Formik et Yup pour les formulaires et leur validation
- Framer Motion pour certaines animations et Recharts pour les graphiques de l'espace administrateur
- API REST Symfony consommée avec `fetch` et Axios
- Docker Compose sous WSL2 pour un environnement de développement reproductible

## Développer en local avec Docker

> Cette procédure correspond à la branche `chore/docker-wsl`, qui contient la configuration Docker du projet. Elle nécessite Docker Engine et le plugin Docker Compose installés dans WSL2. Docker Desktop, Node.js et npm ne sont pas nécessaires sur la machine hôte.

### 1. Cloner le dépôt

Depuis un terminal WSL, clonez le dépôt puis placez-vous sur la branche Docker :

```bash
git clone git@github.com:robertoreynaleon/vitegourmand-frontend.git
cd vitegourmand-frontend
git switch chore/docker-wsl
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

L'application est disponible sur [http://localhost:3000](http://localhost:3000). Le code source est monté dans le conteneur : les modifications effectuées dans `src/` déclenchent donc le rechargement automatique de React.

Vérifiez l'état du service :

```bash
docker compose ps
```

### 3. Connecter le front-end à l'API locale

Par défaut, le conteneur React appelle l'API Symfony locale à l'adresse suivante :

```text
http://localhost:8000
```

Démarrez donc le dépôt [vitegourmand-back-end](https://github.com/robertoreynaleon/vitegourmand-back-end) dans un second terminal WSL, sur la même branche :

```bash
git clone git@github.com:robertoreynaleon/vitegourmand-back-end.git
cd vitegourmand-back-end
git switch chore/docker-wsl
docker compose up --build -d
```

Le back-end lance les services nécessaires à l'application complète : Symfony, MySQL, phpMyAdmin, MongoDB et Mailpit. Consultez son README pour les adresses et les identifiants de développement.

### 4. Modifier les adresses locales si nécessaire

L'URL de l'API est fournie au conteneur par la variable `VG_BACKEND_URL`. Par exemple, pour appeler une API disponible sur le port `8001` :

```bash
VG_BACKEND_URL=http://localhost:8001 docker compose up --build -d
```

Si le port `3000` est déjà utilisé, vous pouvez exposer le front-end sur un autre port :

```bash
VG_FRONTEND_PORT=3001 docker compose up --build -d
```

Dans ce cas, l'application est accessible sur [http://localhost:3001](http://localhost:3001).

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

## Contribution

Créez une branche dédiée pour chaque évolution, puis conservez des commits courts et explicites. Les URL propres à un environnement, les tokens et les autres informations sensibles ne doivent pas être ajoutés à Git.
