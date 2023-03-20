FROM node:18-alpine AS builder
WORKDIR /temp

COPY package.json package.json
COPY yarn.lock yarn.lock

ENV NODE_ENV=development
RUN ["yarn", "install", "--frozen-lockfile", "--ignore-engines"]

COPY . .
ENV NODE_ENV=production
RUN ["yarn", "build"]
RUN ["yarn", "install", "--frozen-lockfile", "--production", "--ignore-engines"]

# Production stage, thinner image with only what we need
FROM node:18-alpine AS production
WORKDIR /srv

COPY --from=builder /temp/.env.defaults .env.defaults
COPY --from=builder /temp/build build
COPY --from=builder /temp/docs docs
COPY --from=builder /temp/license license
COPY --from=builder /temp/package.json package.json
COPY --from=builder /temp/storage storage
COPY --from=builder /temp/version version
COPY --from=builder /temp/yarn.lock yarn.lock
COPY --from=builder /temp/node_modules node_modules

ENV NODE_ENV=production
ENV PORT=7200

USER node

ENTRYPOINT [ "yarn", "start" ]