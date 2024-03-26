FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --only=production --silent && npm cache clean --force --silent

# Bundle app source
COPY . .
RUN npm run build

# Remove source files
RUN rm -rf src

EXPOSE 8080
CMD [ "node", "dist/server.js" ]