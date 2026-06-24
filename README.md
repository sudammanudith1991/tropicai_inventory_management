# Tropicai Inventory Management System

Full-stack inventory, sales, and credit management system for Tropicai.

## Stack
- **Backend**: Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA
- **Frontend**: React 18, Vite, Axios, TailwindCSS
- **Database**: PostgreSQL (AWS RDS t3.micro free tier)
- **Infra**: AWS EC2 t2.micro + Docker Compose (free tier), S3 + CloudFront (always free)
- **CI/CD**: GitHub Actions → SSH deploy to EC2

## Modules
- Vendor purchase management
- Customer order & invoicing
- Inventory / stock tracking
- Credit tracking per customer
- Low-stock alerts (scheduled)
- Financial dashboard

## Local Development

### Prerequisites
- Java 17+, Maven 3.8+
- Node 18+, npm
- Docker & Docker Compose
- PostgreSQL (or use the docker-compose postgres service)

### Run locally
```bash
# Start everything
docker-compose up --build

# Backend only (with local postgres)
cd backend && mvn spring-boot:run

# Frontend only
cd frontend && npm install && npm run dev
```

### Environment variables
Copy `.env.example` to `.env` and fill in your values before running.

## Deployment (AWS Free Tier)
See `docs/deployment.md` for full AWS setup guide.
