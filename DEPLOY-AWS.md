# AWS Docker Deployment

This setup runs the full app on one EC2 instance:

- `frontend` on port `80`
- `backend` on port `8082`
- `mysql` only inside Docker

The frontend container serves the React build with Nginx and proxies `/api` to the backend, so users only need your EC2 public IP.

## 1. Prepare the EC2 instance

Open these security-group inbound ports:

- `22` for SSH
- `80` for the frontend
- `8082` only if you want direct backend access for testing

Install Docker and Compose on the instance, then clone this repo.

## 2. Configure environment variables

Create a `.env` file in the project root:

```env
MYSQL_ROOT_PASSWORD=strong-root-password
MYSQL_DATABASE=cinevault
MYSQL_USER=cinevault
MYSQL_PASSWORD=strong-app-password
CINEVAULT_JWT_SECRET=use-a-long-random-secret
CINEVAULT_CORS_ALLOWED_ORIGINS=http://YOUR_EC2_PUBLIC_IP
REACT_APP_API_URL=/api
```

Replace `YOUR_EC2_PUBLIC_IP` with the real public IP of your EC2 instance.

## 3. Start the stack

```bash
docker compose up --build -d
```

## 4. Verify

- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- Backend: `http://YOUR_EC2_PUBLIC_IP:8082/api/movies`

## 5. Update after changes

```bash
git pull
docker compose up --build -d
```
