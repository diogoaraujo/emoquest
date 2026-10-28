# Build a partir da RAIZ do repositório (a API reutiliza histórias e emoções de src/):
#   docker build -f server/Dockerfile -t emoquest-api .
FROM node:22-alpine AS build
WORKDIR /app
COPY server/package*.json server/
RUN cd server && npm ci
COPY src/types.ts src/types.ts
COPY src/data src/data
COPY src/lib/scoring.ts src/lib/scoring.ts
COPY server server
RUN cd server && npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/server/dist ./dist
COPY server/drizzle ./drizzle
USER node
EXPOSE 3333
CMD ["node", "dist/index.js"]
