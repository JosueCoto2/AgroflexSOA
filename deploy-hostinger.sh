#!/bin/bash
# ============================================================
#  AgroFlex SOA — Script de despliegue en VPS Hostinger
#  Ejecutar como root en Ubuntu 22.04
#
#  Uso:
#    chmod +x deploy-hostinger.sh
#    ./deploy-hostinger.sh tudominio.com.mx
# ============================================================

set -e

DOMAIN=$1
APP_DIR="/opt/agroflex"

if [ -z "$DOMAIN" ]; then
  echo "❌ Uso: ./deploy-hostinger.sh tudominio.com.mx"
  exit 1
fi

echo "========================================================"
echo "  AgroFlex — Deploy VPS Hostinger"
echo "  Dominio: $DOMAIN"
echo "========================================================"

# ── 1. Actualizar sistema ─────────────────────────────────────────────────────
echo ""
echo "▶ [1/7] Actualizando sistema..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git unzip ufw

# ── 2. Instalar Docker ────────────────────────────────────────────────────────
echo ""
echo "▶ [2/7] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "✅ Docker instalado"
else
  echo "✅ Docker ya está instalado"
fi

# Docker Compose plugin
if ! docker compose version &> /dev/null; then
  apt-get install -y docker-compose-plugin
fi

# ── 3. Instalar Certbot ───────────────────────────────────────────────────────
echo ""
echo "▶ [3/7] Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx
echo "✅ Certbot instalado"

# ── 4. Configurar Firewall ────────────────────────────────────────────────────
echo ""
echo "▶ [4/7] Configurando firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
echo "✅ Firewall configurado (22, 80, 443)"

# ── 5. Preparar directorio ────────────────────────────────────────────────────
echo ""
echo "▶ [5/7] Preparando directorio $APP_DIR..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/certbot/www
mkdir -p $APP_DIR/certbot/conf

if [ ! -f "$APP_DIR/.env" ]; then
  echo ""
  echo "⚠️  ACCIÓN REQUERIDA:"
  echo "   Copia tu .env.production al servidor:"
  echo "   scp .env.production root@$(hostname -I | awk '{print $1}'):$APP_DIR/.env"
  echo ""
  echo "   Luego vuelve a ejecutar este script o continúa manualmente."
  exit 0
fi

# ── 6. Obtener certificado SSL ────────────────────────────────────────────────
echo ""
echo "▶ [6/7] Obteniendo certificado SSL para $DOMAIN..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  # Detener nginx temporal si corre
  docker stop agroflex-nginx 2>/dev/null || true
  
  certbot certonly --standalone \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "admin@$DOMAIN" \
    --no-eff-email
  echo "✅ Certificado SSL obtenido"
else
  echo "✅ Certificado SSL ya existe"
fi

# ── 7. Levantar servicios ─────────────────────────────────────────────────────
echo ""
echo "▶ [7/7] Levantando AgroFlex con Docker Compose..."
cd $APP_DIR

# Reemplazar dominio en nginx.prod.conf
sed -i "s/DOMINIO_AQUI/$DOMAIN/g" nginx/nginx.prod.conf

# Levantar todos los servicios
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d --build

echo ""
echo "========================================================"
echo "  ✅ AgroFlex desplegado exitosamente"
echo ""
echo "  Frontend: https://$DOMAIN"
echo "  API:      https://$DOMAIN/api"
echo "  Eureka:   https://$DOMAIN/eureka"
echo ""
echo "  Ver logs: docker compose logs -f"
echo "  Detener:  docker compose down"
echo "========================================================"

# Renovación automática del certificado SSL
echo ""
echo "▶ Configurando renovación automática de SSL..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker compose -C $APP_DIR restart nginx") | crontab -
echo "✅ Renovación SSL configurada (diario 3:00 AM)"
