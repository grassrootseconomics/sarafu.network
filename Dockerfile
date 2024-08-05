FROM node:20-slim AS base
RUN apt-get update || : && apt-get install -y \
  python3 \
  build-essential
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=website --prod /prod/website
RUN pnpm deploy --filter=server --prod /prod/server

FROM base AS website
COPY --from=build /prod/website /prod/website
WORKDIR /prod/website
EXPOSE 8000
CMD [ "pnpm", "start" ]

FROM base AS server
COPY --from=build /prod/app2 /server/server
WORKDIR /prod/server
EXPOSE 8001
CMD [ "pnpm", "start" ]