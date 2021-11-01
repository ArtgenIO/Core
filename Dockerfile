FROM node:16-alpine AS builder
WORKDIR /temp

COPY .yarnrc .yarnrc
COPY package.json package.json
COPY yarn.lock yarn.lock

ENV NODE_ENV=development
RUN ["yarn", "install", "--frozen-lockfile"]

COPY . .
ENV NODE_ENV=production
RUN ["yarn", "build"]

# Production stage, thinner image with only what we need
FROM node:16-alpine AS production
WORKDIR /srv

COPY --from=builder /temp/.yarnclean .yarnclean
COPY --from=builder /temp/.yarnrc .yarnrc
COPY --from=builder /temp/package.json package.json
COPY --from=builder /temp/yarn.lock yarn.lock
COPY --from=builder /temp/build build
COPY --from=builder /temp/storage storage
COPY --from=builder /temp/template template
COPY --from=builder /temp/config config

ENV NODE_ENV=production
ENV PORT=3000

RUN ["yarn", "install", "--frozen-lockfile", "--production"]
RUN ["yarn", "autoclean", "--force"]

USER node

ENTRYPOINT [ "yarn", "start" ]