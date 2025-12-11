# Alpha Tech Backend

API REST para el sistema de collar inteligente para mascotas.

## 🚀 Inicio Rápido

```bash
# Con Docker
docker-compose up -d

# Desarrollo local
npm install
npm run start:dev
```

## 📡 Endpoints Principales

### Autenticación
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/profile` - Perfil usuario

### Mascotas
- `GET /pets` - Mis mascotas
- `POST /pets` - Crear mascota
- `GET /pets/:id` - Detalle mascota

### IoT (ESP32)
- `POST /sensor-data/collar/:collarId` - Enviar datos

## 🔧 Variables de Entorno

```env
DATABASE_URL=postgresql://admin:password123@localhost:5432/alpha_tech
JWT_SECRET=alpha-tech-secret-key
PORT=3000
```

## 🏗️ Stack Técnico

- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT Authentication
- Docker