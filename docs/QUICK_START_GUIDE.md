# 🚀 Quick Start Guide - Módulo de Autenticación AgroFlex

## ⚡ Guía de Inicio Rápido

### Fase 1: Verificación de Dependencias (5 min)

#### Backend - Verificar `pom.xml`
```bash
cd agroflex-backend/agroflex-auth-service
```

Asegúrate de tener estas dependencias en `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>

<dependency>
    <groupId>jakarta.validation</groupId>
    <artifactId>jakarta.validation-api</artifactId>
</dependency>

<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

Luego compila:
```bash
mvn clean compile
```

#### Frontend - Instalar dependencias
```bash
cd agroflex-frontend
npm install
```

---

### Fase 2: Configuración de Ambiente (5 min)

#### Backend - Variables de Entorno

**Windows (CMD):**
```cmd
set JWT_SECRET=tu_secreto_super_seguro_de_minimo_256_bits_cambiar_en_produccion
```

**Linux/Mac (Terminal):**
```bash
export JWT_SECRET="tu_secreto_super_seguro_de_minimo_256_bits_cambiar_en_produccion"
```

**O crear `.env` en agroflex-auth-service:**
```
JWT_SECRET=tu_secreto_super_seguro_de_minimo_256_bits_cambiar_en_produccion
```

#### Frontend - Variables de Entorno

Crear archivo `agroflex-frontend/.env.local`:
```
VITE_API_URL=http://localhost:8080
```

---

### Fase 3: Base de Datos (10 min)

#### Opción A: Docker Compose (Recomendado)

```bash
cd agroflex-backend/docker

# Desarrollo
docker-compose -f docker-compose.dev.yml up -d

# O Producción
docker-compose -f docker-compose.yml up -d
```

Verificar que MySQL esté corriendo:
```bash
docker ps | grep mysql
# Debería mostrar: mysql:8.0 en puerto 3306
```

#### Opción B: MySQL Local

Asegúrate de tener MySQL 8.0+ instalado y ejecutando:

```bash
# Windows (en XAMPP)
# Abre XAMPP Control Panel y da click a "Start" en MySQL

# O si lo instalaste normalmente
mysql -u root -p

# Crear usuario y BD
CREATE DATABASE agroflex_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'agroflex_user'@'localhost' IDENTIFIED BY 'agroflex_pass';
GRANT ALL PRIVILEGES ON agroflex_db.* TO 'agroflex_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Fase 4: Iniciar Servicios (10 min)

#### Terminal 1: Eureka Server (Discovery Service)

```bash
cd agroflex-backend/agroflex-eureka-server
mvn spring-boot:run

# Debería mostrar: Started EurekaApplication
# Accesible en: http://localhost:8761
```

#### Terminal 2: Auth Service (Backend)

```bash
cd agroflex-backend/agroflex-auth-service
mvn spring-boot:run

# Debería mostrar: Started AuthApplication
# Accesible en: http://localhost:8081/auth
```

#### Terminal 3: Frontend

```bash
cd agroflex-frontend
npm run dev

# Debería mostrar: http://localhost:5173 READY
```

---

### Fase 5: Probar la Autenticación (10 min)

#### 1. Abrir Frontend
```
http://localhost:5173
→ Deberías ver la página de login
```

#### 2. Registrarse
- Link: "¿No tienes cuenta? Regístrate aquí"
- Formulario:
  - Nombre: `Juan`
  - Apellidos: `Pérez García`
  - Correo: `juan@ejemplo.com`
  - Teléfono: `+3160123456`
  - Contraseña: `Password123` (requerido: mayúscula + número)
  - Confirmar: `Password123`
  - Rol: `COMPRADOR`
- Click: "Registrarse"
- Debería redirigir a login con mensaje de éxito

#### 3. Iniciar sesión
- Formulario:
  - Correo: `juan@ejemplo.com`
  - Contraseña: `Password123`
- Click: "Iniciar sesión"
- Debería redirigir a `/buyer/dashboard` (por rol COMPRADOR)

#### 4. Verificar Token
En DevTools (F12):
```javascript
// En console:
localStorage.getItem('auth-store')
// Debería mostrar: {"state": {"accessToken": "eyJ...", ...}}
```

#### 5. Olvidar Contraseña
- Link: "¿Olvidaste la contraseña?"
- Ingresa: `juan@ejemplo.com`
- Debería mostrar: "Si el correo existe, recibirás instrucciones..."
- En bash/terminal del backend deberías ver log del token

---

## 📊 Verificación Rápida de Salud

### Endpoints de Control

```bash
# Eureka está corriendo?
curl http://localhost:8761

# Auth Service está corriendo?
curl http://localhost:8081/auth/actuator/health

# Frontend está servido?
curl http://localhost:5173
```

### Logs para Verificar

**Backend (busca estas líneas):**
```
[main] Started AuthApplication in X seconds
[AbstractDiscoveryClientConfiguration] Initializing Eureka in region us-east-1
[EurekaServiceRegistry] Registering application auth-service with eureka
```

**Frontend (busca):**
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Connection refused: localhost:3306"
**Causa**: MySQL no está corriendo  
**Solución**:
```bash
docker-compose up -d mysql  # Si usas Docker
# O inicia MySQL en tu sistema local
```

### Error: "JWT_SECRET not configured"
**Causa**: Variable de ambiente no está seteada  
**Solución**: En IntelliJ/VSCode, agrega a Run Configurations

**IntelliJ IDEA:**
1. Edit Configurations
2. Busca "Spring Boot"
3. Tab "Environment variables"
4. Agrega: `JWT_SECRET=tu_secreto`

**VSCode + launch.json:**
```json
{
  "args": "--spring.profiles.active=dev",
  "env": { "JWT_SECRET": "tu_secreto" }
}
```

### Error 401 al hacer peticiones autenticadas
**Causa**: Token ha expirado o no se está enviando correctamente  
**Solución**: Revisa en DevTools → Network → Headers → Authorization

### Frontend no conecta al backend
**Causa**: `VITE_API_URL` no está configurado  
**Solución**:
```bash
# En agroflex-frontend raíz
echo "VITE_API_URL=http://localhost:8080" > .env.local
npm run dev
```

---

## 📈 Próximas Funcionalidades

### Inmediatas (Recomendadas)
- [ ] Implementar envío de emails en forgot password
- [ ] Completar dashboards por rol
- [ ] Agregar rate limiting en endpoints auth

### Opcionales (Para después)
- [ ] 2FA con OTP
- [ ] OAuth2 (Google, GitHub)
- [ ] Auditoría de intentos de login
- [ ] Renovación de contraseña periódica

---

## 🔗 Recursos Útiles

- [JWT Spec](https://tools.ietf.org/html/rfc7519)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [React Router Guide](https://reactrouter.com/)
- [Zustand Persistence](https://github.com/reduxjs/redux-persist)
- [MySQL Installation](https://dev.mysql.com/downloads/mysql/)

---

## 📞 Comandos Rápidos

```bash
# Limpiar y compilar backend
mvn clean compile -DskipTests

# Correr backend en modo debug
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"

# Limpiar caché npm frontend
npm cache clean --force && npm install

# Ejecutar pruebas Backend
mvn test

# Ejecutar pruebas Frontend
npm run test

# Build para producción
mvn clean package -DskipTests
npm run build
```

---

**Estado**: ✅ Listo para desarrollo  
**Última actualización**: 11 de Marzo de 2026  
**Versión**: 1.0.0-SNAPSHOT
