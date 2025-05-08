# FreezerAlarm

This project includes:
- Spring Boot backend  
- MySQL database  
- React frontend  

It currently supports local development (via Docker Compose)

## Local Development (Dev Mode)

**1. Requirements**
- Docker & Docker Compose  
- Java 22+ (if running backend manually)  
- Node.js 20+ (if running frontend manually)  

**2. To start Dev Environment**
- Start Docker Desktop  
- Start `BackendApplication` in IntelliJ  

### Inside `frontend` folder:
- Install necessary libraries: `npm install`  
- Run frontend: `npm run dev`

**3. Testing**

**For Backend testing run:**  
`mvn clean verify`  
*Test coverage report can be found in folder:* `target/site/jacoco/index.html`

**For Frontend testing install:**
- `npm install --save-dev c8`  
- `npm install -D @vitest/coverage-v8`

**Run frontend tests:**  
`npx vitest run --coverage`
