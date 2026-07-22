# Image Node utilisée pour le développement local du frontend.
FROM node:22-alpine AS development

WORKDIR /app

# Installation reproductible des dépendances depuis le fichier de verrouillage.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Copie du code source pour permettre aussi un démarrage sans bind mount.
COPY . .

EXPOSE 3000

# Démarrage du serveur React avec rechargement automatique.
CMD ["npm", "start"]
