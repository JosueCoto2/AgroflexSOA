#!/bin/bash
# ============================================================
#  AgroFlex SOA — Script de despliegue para Oracle Cloud
#  Instancia: Arm Ampere A1 (4 OCPUs, 24 GB RAM) — Always Free
#  SO objetivo: Ubuntu 22.04 LTS (ARM64)
#
#  USO:
#    1. Conectarse a la VM:  ssh ubuntu@<IP_PUBLICA>
#    2. Subir este script:   scp deploy-oracle.sh ubuntu@<IP>:~
#    3. Ejecutar:            chmod +x deploy-oracle.sh && ./deploy-oracle.sh
# ============================================================
set -e

REPO_URL="https://github.com/TU_USUARIO/AgroflexSOA.git"   # <-- Cambia esto
APP_DIR="$HOME/AgroflexSOA"

echo "==================================================="
echo "  AgroFlex SOA — Deploy en Oracle Cloud (ARM A1)"
echo "==================================================="

# ── 1. Actualizar sistema ────────────────────────────────────
echo ""
echo "[1/6] Actualizando paquetes del sistema..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Instalar Docker ───────────────────────────────────────
echo ""
echo "[2/6] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "Docker instalado. Nota: Si es la primera vez, cierra sesión SSH y vuelve a entrar."
else
  echo "Docker ya está instalado: $(docker --version)"
fi

# Verificar Docker Compose plugin
if ! docker compose version &> /dev/null; then
  echo "Instalando Docker Compose plugin..."
  sudo apt-get install -y docker-compose-plugin
fi
echo "Docker Compose: $(docker compose version)"

# ── 3. Clonar o actualizar el repositorio ───────────────────
echo ""
echo "[3/6] Descargando código fuente..."
if [ -d "$APP_DIR" ]; then
  echo "Repositorio ya existe. Actualizando..."
  cd "$APP_DIR"
  git pull
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 4. Configurar variables de entorno ──────────────────────
echo ""
echo "[4/6] Configurando variables de entorno..."
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║  ACCIÓN REQUERIDA                                    ║"
  echo "║                                                      ║"
  echo "║  Se creó el archivo .env desde .env.example          ║"
  echo "║  Edítalo con tus claves reales ANTES de continuar:  ║"
  echo "║                                                      ║"
  echo "║    nano $APP_DIR/.env                 ║"
  echo "║                                                      ║"
  echo "║  Variables OBLIGATORIAS:                             ║"
  echo "║    JWT_SECRET           — secreto JWT seguro         ║"
  echo "║    MYSQL_ROOT_PASSWORD  — contraseña MySQL           ║"
  echo "║    STRIPE_SECRET_KEY    — sk_test_... o sk_live_...  ║"
  echo "║    STRIPE_WEBHOOK_SECRET — whsec_...                 ║"
  echo "║    VITE_STRIPE_PK       — pk_test_... o pk_live_...  ║"
  echo "║    MAIL_USER / MAIL_PASS — correo Gmail              ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""
  echo "Cuando termines de editar .env, vuelve a ejecutar este script."
  exit 0
else
  echo ".env ya existe. Continuando..."
fi

# ── 5. Abrir puertos en el firewall de Ubuntu ────────────────
echo ""
echo "[5/6] Configurando firewall (ufw)..."
sudo ufw allow 22/tcp    comment "SSH"
sudo ufw allow 80/tcp    comment "HTTP (AgroFlex Frontend)"
sudo ufw allow 443/tcp   comment "HTTPS (futuro TLS)"
sudo ufw --force enable
echo "Puertos abiertos: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
echo ""
echo "  ⚠  Recuerda abrir el puerto 80 también en las"
echo "     'Reglas de ingreso' de tu Security List en OCI:"
echo "     Networking → VCN → Security Lists → Default → Add Ingress Rule"
echo "     Source CIDR: 0.0.0.0/0  |  Port: 80"

# ── 6. Construir y levantar todos los servicios ──────────────
echo ""
echo "[6/6] Construyendo y levantando AgroFlex (esto puede tardar 5-10 min)..."
cd "$APP_DIR"
docker compose pull mysql 2>/dev/null || true
docker compose build --parallel
docker compose up -d

echo ""
echo "==================================================="
echo "  ✅  AgroFlex SOA está corriendo!"
echo ""
echo "  Frontend:  http://$(curl -s ifconfig.me)"
echo "  Gateway:   http://$(curl -s ifconfig.me):8080"
echo "  Eureka:    http://$(curl -s ifconfig.me):8761"
echo ""
echo "  Ver logs:    docker compose logs -f"
echo "  Ver estado:  docker compose ps"
echo "  Detener:     docker compose down"
echo "==================================================="
