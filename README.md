# Alpha Tech Backend

REST API for the smart pet collar system.

## 🚀 Quick Start

```bash
# With Docker
docker-compose up -d

# Local development
npm install
npm run start:dev
```

## 📡 Main Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - User profile

### Pets
- `GET /pets` - Get my pets
- `POST /pets` - Create pet
- `GET /pets/:id` - Get pet details

### Collar Management
- `POST /collar/commands` - Send command to collar
- `GET /collar/commands/:petId` - Get pending commands
- `POST /collar/assign` - Assign collar to pet

### IoT (ESP32)
- `POST /sensor-data/collar/:collarId` - Send sensor data
- `POST /commands/ack` - Acknowledge command execution

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://admin:password123@localhost:5432/alpha_tech
JWT_SECRET=alpha-tech-secret-key
PORT=3000
```

## 🏗️ Tech Stack

- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT Authentication
- Docker
- ESP32 Integration