# 🗄️ Configuración de Base de Datos - AgroFlex

## 📋 Requisitos Previos

- **MySQL 8.0+** instalado y ejecutándose
- **Java 17+** para compilar los servicios
- **Maven 3.8+** para build
- **Docker y Docker Compose** (opcional, para ambiente containerizado)

---

## 🚀 Opción 1: Configuración Local (Sin Docker)

### 1. Crear la Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# En el prompt de MySQL, ejecutar:
source SOAarquitecture/agroflex_database.sql
```

### 2. Crear Usuario de Aplicación (Opcional pero recomendado)

```sql
-- Crear usuario con permisos limitados
CREATE USER 'agroflex_user'@'localhost' IDENTIFIED BY 'agroflex_pass';

-- Otorgar permisos solo a la base de datos agroflex_db
GRANT ALL PRIVILEGES ON agroflex_db.* TO 'agroflex_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

### 3. Verificar Conexión

```bash
mysql -u agroflex_user -p agroflex_db -h localhost
# Contraseña: agroflex_pass
```

### 4. Credenciales de Conexión

Ya están configuradas en los archivos `application.yml` de cada servicio:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/agroflex_db
    username: agroflex_user
    password: agroflex_pass
    driver-class-name: com.mysql.cj.jdbc.Driver
```

---

## 🐳 Opción 2: Configuración con Docker Compose

### Levantar los servicios

```bash
# Cambiar al directorio del proyecto
cd agroflex-backend

# Levantar solo la base de datos
docker-compose up -d mysql

# Esperar 30 segundos para que MySQL esté listo
sleep 30

# Levantar todos los servicios
docker-compose up -d
```

### Verificar contenedores

```bash
docker-compose ps
```

### Ver logs

```bash
# Logs de MySQL
docker-compose logs mysql

# Logs de un servicio específico
docker-compose logs auth-service

# Seguir logs en tiempo real
docker-compose logs -f gateway
```

### Detener servicios

```bash
# Detener todos (sin eliminar volúmenes)
docker-compose down

# Detener y eliminar volúmenes (reinicia la BD)
docker-compose down -v
```

---

## 📊 Puertos de Servicios

| Servicio | Puerto | Contexto | 
|----------|--------|----------|
| Gateway | 8080 | / |
| Auth Service | 8081 | /auth |
| Catalog Service | 8082 | /catalog |
| Users Service | 8083 | /users |
| Orders Service | 8084 | /orders |
| Payments Service | 8085 | /payments |
| QR Service | 8086 | /qr |
| Geolocation Service | 8087 | /geolocation |
| Notifications Service | 8088 | /notifications |
| Eureka Server | 8761 | /eureka |
| Config Server | 8888 | / |
| MySQL | 3306 | - |

---

## 🔌 Verificar Conectividad

### 1. Eureka Server (Service Discovery)
```bash
curl http://localhost:8761/eureka/apps
```

### 2. Gateway
```bash
curl http://localhost:8080/actuator/health
```

### 3. Base de Datos
```bash
# Verificar estado de MySQL desde terminal
mysql -u agroflex_user -p agroflex_pass -h localhost agroflex_db -e "SELECT 1;"
```

---

## 📝 Variables de Entorno Personalizadas

Para cambiar las credenciales de BD, editar en:

1. **En `application.yml` de cada servicio:**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/agroflex_db
    username: TU_USUARIO
    password: TU_CONTRASEÑA
```

2. **En `docker-compose.yml`:**
```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: tu_contraseña_root
    MYSQL_USER: tu_usuario
    MYSQL_PASSWORD: tu_contraseña
```

3. **En `docker-compose.dev.yml`:**
Mismo formato que docker-compose.yml

---

## 🛠️ Troubleshooting

### MySQL no inicia
```bash
# Verificar si el puerto 3306 está en uso
netstat -ano | findstr :3306

# Matar proceso (Windows PowerShell Admin)
Stop-Process -Id <PID> -Force
```

### Error: "Access denied for user 'agroflex_user'@'localhost'"
```sql
-- Reiniciar con root y crear usuario correctamente
mysql -u root -p

FLUSH PRIVILEGES;
```

### Servicios no se registran en Eureka
- Verificar que Eureka esté escuchando en puerto 8761
- Revisar logs: `docker-compose logs eureka-server`
- Asegurar conectividad entre contenedores: `docker network ls`

### Volumen de datos persistente
```bash
# Ver volúmenes creados
docker volume ls

# Inspeccionar volumen específico
docker volume inspect mysql_data

# Eliminar volumen (cuidado, borra datos)
docker volume rm mysql_data
```

---

## 📚 Referencias

- [MySQL Docker Documentation](https://hub.docker.com/_/mysql)
- [Spring Boot Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Cloud Netflix Eureka](https://spring.cloud.io/spring-cloud-netflix/)

---

**Última actualización:** 11 de marzo de 2026
