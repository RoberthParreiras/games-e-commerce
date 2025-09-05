# Stage 1: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package*.json ./
COPY bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Stage 2: Create the production image
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD [ "bun", "start" ]