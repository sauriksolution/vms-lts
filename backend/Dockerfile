# Build project
FROM node:16-alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=development

COPY . .

RUN npm run build

# Run and build project, but used cached build layer from above
FROM node:16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]