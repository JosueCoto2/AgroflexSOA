# ── Etapa 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_STRIPE_PK se embebe en el bundle de React durante el build
ARG VITE_STRIPE_PK
ENV VITE_STRIPE_PK=$VITE_STRIPE_PK
RUN npm run build

# ── Etapa 2: Servir con nginx ────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
