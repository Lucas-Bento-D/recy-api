ARG NODE_VERSION="20.17"

FROM docker.io/node:${NODE_VERSION}-alpine3.19 AS base

WORKDIR /app

RUN apk --update --no-cache add curl && \
    apk add --no-cache \
    pkgconfig \
    gcc \
    pixman-dev \
    cairo-dev \
    pango-dev \
    make \
    build-base

COPY package*.json ./

RUN npm cache clean --force
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 80

CMD [ "npm", "run", "start:migrate:prod" ]
