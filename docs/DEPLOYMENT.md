# LMS Application Deployment Guide

Panduan lengkap untuk deploy aplikasi LMS ke berbagai hosting platform.

---

## Prerequisites

- Docker dan Docker Compose terinstall
- Git repository (GitHub/GitLab/Bitbucket)
- Akun hosting (pilih salah satu di bawah)

---

## Option 1: Railway (Recommended - Termudah)

Railway otomatis mendeteksi Dockerfile dan deploy.

### Steps:

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Add Docker deployment configuration"
   git push origin main
   ```

2. **Connect Railway**
   - Buka [railway.app](https://railway.app)
   - Klik **New Project** → **Deploy from GitHub repo**
   - Pilih repository `lmsapp`
   - Railway akan auto-detect Dockerfile

3. **Configure Environment**
   - Settings → Variables → Add jika diperlukan
   - Port akan otomatis terdeteksi (3000)

4. **Generate Domain**
   - Settings → Domains → **Generate Domain**
   - Atau tambahkan custom domain

**Biaya:** Free tier tersedia, $5/bulan untuk production

---

## Option 2: DigitalOcean App Platform

### Steps:

1. **Push ke GitHub** (sama seperti di atas)

2. **Create App**
   - Buka [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
   - Klik **Create App** → Pilih GitHub
   - Pilih repository dan branch

3. **Configure Resources**
   - Type: **Web Service**
   - Source: **Dockerfile**
   - HTTP Port: `3000`

4. **Deploy**
   - Review settings → **Create Resources**
   - Tunggu build selesai (~3-5 menit)

**Biaya:** Mulai $5/bulan (Basic)

---

## Option 3: VPS Manual (DigitalOcean/Vultr/Linode)

### Step 1: Setup VPS

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y
```

### Step 2: Clone & Deploy

```bash
# Clone repo
git clone https://github.com/your-username/lmsapp.git
cd lmsapp

# Build & Run
docker compose up -d --build

# Verify
docker compose ps
curl http://localhost:3000
```

### Step 3: Setup Nginx Reverse Proxy (Optional)

```bash
apt install nginx -y
```

Buat file `/etc/nginx/sites-available/lmsapp`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/lmsapp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Step 4: SSL dengan Certbot

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

---

## Option 4: Docker Hub + Any Hosting

### Step 1: Build & Push ke Docker Hub

```bash
# Login
docker login

# Build dengan tag
docker build -t yourusername/lmsapp:latest .

# Push
docker push yourusername/lmsapp:latest
```

### Step 2: Pull di Server

```bash
# Di server hosting
docker pull yourusername/lmsapp:latest
docker run -d -p 3000:3000 --name lmsapp yourusername/lmsapp:latest
```

---

## Local Testing (Sebelum Deploy)

```bash
# Build image
docker compose build

# Run container
docker compose up -d

# Check logs
docker compose logs -f

# Test
curl http://localhost:3000

# Stop
docker compose down
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build gagal | Pastikan `npm ci` berhasil di local dulu |
| Container crash | Cek logs: `docker compose logs` |
| Port conflict | Ubah port di `docker-compose.yml` |
| Image terlalu besar | Pastikan `.dockerignore` benar |

---

## Environment Variables (Jika Diperlukan)

Tambahkan di `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=postgresql://...
  - NEXTAUTH_SECRET=your-secret
  - NEXTAUTH_URL=https://yourdomain.com
```

Atau buat file `.env.production` dan mount ke container.

---

## Rekomendasi

| Platform | Cocok Untuk | Harga Mulai |
|----------|-------------|-------------|
| Railway | MVP, Startup | Free - $5/mo |
| DigitalOcean App | Production | $5/mo |
| VPS Manual | Full Control | $4-6/mo |
| Vercel | Next.js Native | Free - $20/mo |

> **Catatan:** Vercel adalah pilihan terbaik untuk Next.js jika tidak memerlukan Docker, karena terintegrasi langsung.
