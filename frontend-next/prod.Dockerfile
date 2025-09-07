# Stage 1: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package*.json ./
COPY bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Add this line to fix permissions
RUN chmod -R 755 ./.next/static

# Stage 2: Create the production image
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD [ "bun", "server.js" ]