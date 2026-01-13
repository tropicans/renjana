# Deploy Renjana LMS di Proxmox Tropicans

Setup spesifik untuk server Proxmox Tropicans.

---

## Environment Info
- **Network:** 192.168.10.x
- **Suggested CT ID:** 110
- **Suggested IP:** 192.168.10.110
- **Cloudflare Tunnel:** Via CT 106 (edge-router)

---

## Step 1: Buat Container di Proxmox

1. **Create CT** dengan settings:
   - **CT ID:** `110`
   - **Hostname:** `renjana-app`
   - **Template:** `debian-12` atau `ubuntu-22.04`
   - **Disk:** `local-lvm`, 10GB
   - **CPU:** 2 cores
   - **Memory:** 2048 MB
   - **Network:** `vmbr0`, IP `192.168.10.110/24`, Gateway `192.168.10.1`

2. **Options Tab - PENTING:**
   - ✅ **Nesting:** Enabled
   - ✅ **Keyctl:** Enabled
   
   (Sama seperti CT 109 Freqtrade)

3. **Start container**

---

## Step 2: Setup di dalam Container

```bash
# Masuk ke CT
pct enter 110

# Update sistem
apt update && apt upgrade -y

# Install dependencies
apt install -y curl git ca-certificates gnupg

# Install Docker
curl -fsSL https://get.docker.com | sh

# Verify
docker --version
docker run hello-world
```

---

## Step 3: Deploy Aplikasi

```bash
# Clone repository
cd /opt
git clone https://github.com/tropicans/renjana.git
cd renjana

# Build & Run
docker compose up -d --build

# Cek status
docker compose ps

# Test
curl http://localhost:3000
```

---

## Step 4: Setup Cloudflare Tunnel (CT 106)

Di **CT 106 (edge-router)**, tambahkan service baru di Cloudflare Dashboard:

### Cloudflare Zero Trust Settings:
| Setting | Value |
|---------|-------|
| **Public Hostname** | `renjana.kelazz.my.id` (atau subdomain lain) |
| **Service Type** | HTTP |
| **URL** | `http://192.168.10.110:3000` |
| **HTTP Host Header** | `renjana.kelazz.my.id` |
| **No TLS Verify** | ON |

Setelah di-save, aplikasi akan live di: **https://renjana.kelazz.my.id**

---

## Step 5: Tambah Monitoring Script (Optional)

Di CT 106, update script monitoring untuk include Renjana:

```bash
# Edit script
nano /usr/local/bin/check_renjana.sh
```

```bash
#!/bin/bash
URL="https://renjana.kelazz.my.id"
APP_IP="192.168.10.110"

STATUS=$(curl -o /dev/null -s -w "%{http_code}" $URL)

if [ $STATUS -eq 502 ]; then
    echo "$(date): Renjana Down (502). Restarting..."
    ssh root@$APP_IP "cd /opt/renjana && docker compose restart"
fi
```

```bash
chmod +x /usr/local/bin/check_renjana.sh

# Tambah cron (setiap 5 menit)
echo "*/5 * * * * /usr/local/bin/check_renjana.sh >> /var/log/renjana-monitor.log 2>&1" >> /etc/crontab
```

---

## Update Dokumentasi Proxmox

Tambahkan ke tabel container Anda:

| ID | Nama Container | IP Internal | RAM / Disk | URL Publik / Layanan |
|----|----------------|-------------|------------|----------------------|
| 110 | **renjana-app** | 192.168.10.110 | 2.0GB / 10GB | `https://renjana.kelazz.my.id` |

---

## Maintenance

```bash
# SSH ke CT
ssh root@192.168.10.110

# Update aplikasi
cd /opt/renjana
git pull
docker compose down
docker compose up -d --build

# Logs
docker compose logs -f
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker gagal | Pastikan Nesting + Keyctl enabled |
| 502 di Cloudflare | Cek container running: `docker compose ps` |
| Tidak bisa akses 3000 | Cek firewall: `ufw status` |
