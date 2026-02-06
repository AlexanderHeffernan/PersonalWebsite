# CI/CD Setup for Raspberry Pi

This setup uses GitHub Actions to build Docker images and deploy them to your Raspberry Pi.

## Prerequisites

1. Docker and Docker Compose installed on your Pi ([install guide](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script))
2. SSH key-based access to your Pi
3. A GitHub repository

### Installing Docker on Raspberry Pi

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (log out and back in after this)
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Test installation
docker run hello-world
```

## Setup Instructions

### 1. On Your Raspberry Pi

Create the project directory:
```bash
mkdir -p ~/personal-website
cd ~/personal-website
```

Create a `.env` file with your GitHub username and secrets:
```bash
cat > .env << 'EOF'
# GitHub Container Registry image
IMAGE_NAME=ghcr.io/YOUR_GITHUB_USERNAME/personal-website:latest

# App configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://your-pi-ip:3000/api/auth/github/callback
DB_PATH=/app/data/database.sqlite
EOF
```

**Important**: Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username!

Create the data directory:
```bash
mkdir -p data
```

Copy the deployment scripts from this repo:
```bash
# From this repo, copy these files to your Pi:
# - docker-compose.yml
# - scripts/deploy.sh
# - scripts/auto-update.sh
# - scripts/migrate.js
# - scripts/migrations/ (directory)

chmod +x scripts/deploy.sh scripts/auto-update.sh
```

### 2. First Deployment

Push this code to your GitHub repository. This will trigger the GitHub Actions workflow to build your Docker image.

Check the Actions tab in your repo - once the "Build and Deploy" workflow completes successfully, your image will be available at:
```
ghcr.io/YOUR_GITHUB_USERNAME/personal-website:latest
```

### 3. Deploy Options

#### Option A: Manual Deploy (Recommended to start)

After the GitHub Actions build completes:

1. SSH to your Pi
2. Run:
```bash
cd ~/personal-website
./scripts/deploy.sh
```

This single command will:
- Pull the latest Docker image
- Start/restart the container
- Run any pending database migrations
- Verify the app is healthy

#### Option B: GitHub Actions Auto-Deploy

If your Pi is reachable from GitHub Actions (has a public IP or you use a VPN):

1. Go to **Settings → Secrets and variables → Actions** in your GitHub repo
2. Add these secrets:
   - `PI_HOST`: Your Pi's IP address (e.g., `192.168.1.100` or public IP)
   - `PI_USER`: Your Pi username (e.g., `pi`)
   - `PI_SSH_KEY`: Your private SSH key (the one that can access your Pi)
3. Uncomment the `deploy` job in `.github/workflows/deploy.yml`

#### Option C: Auto-Update on Pi (Best for local-only Pis)

Set up a cron job on your Pi to check for updates every 5 minutes:

```bash
# Create logs directory
mkdir -p ~/personal-website/logs

# Edit crontab
crontab -e

# Add this line:
*/5 * * * * /home/pi/personal-website/scripts/auto-update.sh >> /home/pi/personal-website/logs/auto-update.log 2>&1
```

Now your Pi will automatically check for new images every 5 minutes and deploy them!

## How It Works

1. **GitHub Actions**: Builds an ARM64 Docker image on every push to `main`
2. **Image Registry**: Pushes image to GitHub Container Registry (free)
3. **Deployment**: 
   - Pulls latest image
   - Starts container with persistent SQLite volume
   - Runs migrations automatically
   - Health check verifies deployment

## Database Persistence

The SQLite database is stored in `./data/` on your Pi and mounted into the container. It persists across deployments.

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart app
docker-compose restart

# Stop app
docker-compose down

# Manual deploy
./scripts/deploy.sh

# Check for updates manually
./scripts/auto-update.sh
```

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs
```

**Database issues:**
```bash
# Check database exists
ls -la data/

# Access database directly
docker-compose exec app sh
sqlite3 /app/data/database.sqlite
```

**Permission issues:**
```bash
# Fix permissions on data directory
chmod 755 data
```
