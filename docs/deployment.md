# Deployment Guide — AWS Free Tier

## 1. AWS Setup

### EC2 (t2.micro)
1. Launch EC2 → Amazon Linux 2023 → t2.micro → 30 GB gp2 storage
2. Security group: allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
3. Create key pair → download `.pem` file
4. SSH in: `ssh -i tropicai.pem ec2-user@<your-ec2-ip>`

### Install Docker on EC2
```bash
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Install docker-compose plugin
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### RDS PostgreSQL (db.t3.micro)
1. RDS → Create database → PostgreSQL → Free tier
2. DB identifier: `tropicai-db`
3. Username: `tropicai` + set a strong password
4. VPC: same as EC2, security group allows EC2 to reach port 5432

## 2. GitHub Secrets

Add these in your repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 public IP |
| `EC2_SSH_KEY` | Contents of your `.pem` file |
| `VITE_API_URL` | `http://<EC2-IP>` |

## 3. EC2 App Setup

```bash
mkdir ~/tropicai && cd ~/tropicai

# Create .env with your RDS endpoint and secrets
cat > .env << 'EOF'
SPRING_DATASOURCE_URL=jdbc:postgresql://<RDS-ENDPOINT>:5432/tropicai
DB_USER=tropicai
DB_PASSWORD=your_rds_password
JWT_SECRET=your_64_char_random_string
AWS_S3_BUCKET=tropicai-files
AWS_REGION=ap-south-1
ALLOWED_ORIGINS=http://<EC2-IP>
EOF

# Copy docker-compose.prod.yml here as docker-compose.yml
```

## 4. Deploy

Push to `main` — GitHub Actions will:
1. Build backend JAR
2. Build Docker images
3. Push to GHCR (free for public repos)
4. SSH into EC2 and run `docker compose pull && docker compose up -d`

## 5. First login

- URL: `http://<EC2-IP>`
- Username: `admin`
- Password: `Admin@123`
- **Change password immediately after first login**

## Cost reminder

Free for 12 months from AWS account creation:
- EC2 t2.micro: 750 hrs/month ✓
- RDS db.t3.micro: 750 hrs/month ✓
- S3: 5 GB always free ✓
- CloudFront: 1 TB always free ✓

After 12 months: ~$15–20/month total.
