# AWS Deployment & Production Guide

Detailed instructions for deploying and maintaining the Onchat platform on the AWS EC2 environment.

## 🔑 Infrastructure Access

### SSH Connection
- **IP**: `13.126.135.253`
- **User**: `ubuntu`
- **Key**: `onchat.pem` (Stored in `~/Downloads`)
- **Command**:
  ```bash
  ssh -i ~/Downloads/onchat.pem ubuntu@13.126.135.253
  ```

---

## 🚀 Deployment Workflow

### 1. Repository Refresh
Always sync with the `main` branch before building:
```bash
git pull origin main
```

### 2. Dependency Management
Install at the root for workspace support:
```bash
npm install
```

### 3. Prisma Client Generation
**CRITICAL**: If the build fails with "Property does not exist on User", regenerate the client:
```bash
npx prisma generate --schema=apps/server/prisma/schema.prisma
```

### 4. Build Process (Turbo)
Build both the backend and frontend simultaneously:
```bash
npx turbo build --filter=server --filter=user-web
```

---

## 🛠️ Service Management

### Backend (PM2)
Manage the Node.js API server:
- **Restart**: `pm2 restart onchat-server`
- **Logs**: `pm2 logs onchat-server`
- **Monitor**: `pm2 monit`

### Frontend (Nginx)
The web application is served as static files:
- **Update Static Files**:
  ```bash
  sudo cp -rv apps/user-web/dist/* /var/www/app.onchat.fun/
  ```
- **Restart Nginx**:
  ```bash
  sudo systemctl restart nginx
  ```

---

## 🔍 Troubleshooting

### Build Failures
- **Error**: `Cannot find module '@prisma/client'`
  - **Fix**: Run `npx prisma generate` again and ensure `node_modules` is populated in `apps/server`.

- **Error**: `Memory limit reached during build`
  - **Fix**: Rebuild with `NODE_OPTIONS=--max-old-space-size=4096`.
