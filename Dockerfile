
FROM oven/bun:1-slim AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build && bun install --production --frozen-lockfile

FROM oven/bun:distroless
WORKDIR /app
COPY --from=builder /app/build build
COPY --from=builder /app/node_modules node_modules

ENV PORT=8080

CMD ["build/index.js"]
