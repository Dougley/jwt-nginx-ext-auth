FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY tsconfig.json ./
COPY package*.json ./
COPY src ./src

RUN npm install && npm cache clean --force --silent
RUN npm run build

RUN npm prune --production

EXPOSE 8080
CMD ["npm", "start"]