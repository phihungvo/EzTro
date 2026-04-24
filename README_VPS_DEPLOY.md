# Deploy VPS Production

Tài liệu này là checklist deploy production ngắn cho stack hiện tại:

- Backend: `ez_tro_api/`
- Frontend: `ez_tro_app/`
- Docker Compose production: `docker-compose.prod.yml`
- Nginx reverse proxy: `nginx/nginx.conf`
- CI: `.github/workflows/ci.yml`
- CD: `.github/workflows/cd.yml`
- Reusable config check: `.github/actions/validate-cicd-config/action.yml`
- Reusable backend build: `.github/workflows/build-backend-image.yml`
- Reusable frontend build: `.github/workflows/build-frontend-image.yml`
- Reusable VPS deploy: `.github/workflows/deploy-vps.yml`

## 1. Kiến trúc deploy

- Pull request vào `main` sẽ chạy build/test qua `ci.yml`, nhưng không push image và không deploy.
- `ci.yml` sẽ gọi lại cùng reusable build workflows với `push: false`.
- GitHub Actions build backend và frontend trên runner.
- Workflow `cd.yml` sẽ validate secrets/variables trước khi build với push/main hoặc manual dispatch.
- Frontend sẽ chạy test tự động nếu có test file.
- Docker image được push lên Docker Hub.
- VPS Ubuntu cập nhật tag image trong `.env`, rồi pull image và chạy `docker compose up -d`.
- Stack production gồm `backend`, `frontend`, `mysql`, `redis`, `minio`, và `nginx` reverse proxy.
- Backend và frontend chạy bằng image đã build sẵn, không build lại trên VPS.
- Nginx public ra Internet qua port `80` và route `/api`, `/ws`, `/minio`, và `/` về đúng service.

## 2. File cần có trên VPS

Đặt toàn bộ ở một thư mục cố định, ví dụ:

```text
/opt/ez-tro/
├── docker-compose.prod.yml
├── .env
└── nginx/
    └── nginx.conf
```

## 3. Cài Docker trên Ubuntu

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Đăng xuất và đăng nhập lại để dùng Docker không cần `sudo`.

## 4. Mở port cần thiết

- `22/tcp`: SSH
- `80/tcp`: HTTP

Nếu dùng UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

## 5. File `.env`

Copy từ `.env.example` rồi điền giá trị thật:

- `DOCKER_USERNAME`
- `BACKEND_IMAGE_TAG`
- `FRONTEND_IMAGE_TAG`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `FILE_UPLOAD_DIR`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_DEBUG`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_BASE_PATH`
- `REACT_APP_API_URL`
- `REACT_APP_WS_URL`
- `REACT_APP_MINIO_URL`

Không commit `.env` lên GitHub.

## 6. Chạy production trên VPS

```bash
cd /opt/ez-tro
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Khi muốn deploy version mới:

```bash
cd /opt/ez-tro
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

Workflow GitHub Actions sẽ tự cập nhật `DOCKER_USERNAME`, `BACKEND_IMAGE_TAG`, và `FRONTEND_IMAGE_TAG` trong `.env` trên VPS trước khi chạy lệnh trên.

## 7. Flow CI/CD

```text
git push
  ↓
Pull request -> `ci.yml` build/test
  ↓
Merge/push `main` -> `cd.yml` validate config
  ↓
GitHub Actions build backend/frontend + push image
  ↓
Push Docker image lên Docker Hub
  ↓
SSH vào VPS
  ↓
docker compose pull
  ↓
docker compose up -d
```

## 8. Secrets cần cấu hình trong GitHub

Vào repo GitHub, mở `Settings` -> `Secrets and variables` -> `Actions`.

### Secrets

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `VPS_HOST`
- `VPS_SSH_KEY`

### Variables

Khuyến nghị thêm repo variables:

- `REACT_APP_API_URL`
- `REACT_APP_WS_URL`
- `REACT_APP_MINIO_URL`

### Giá trị gợi ý

- `REACT_APP_API_URL`: `https://your-domain.com/api` hoặc `http://your-domain.com/api`
- `REACT_APP_WS_URL`: `wss://your-domain.com/ws` hoặc `ws://your-domain.com/ws`
- `REACT_APP_MINIO_URL`: `https://files.your-domain.com` hoặc `http://files.your-domain.com`

### Lưu ý

- `VPS_SSH_KEY` nên là private key dùng để SSH vào VPS.
- `DOCKER_USERNAME` phải khớp với namespace image trên Docker Hub.
- Workflow `cd.yml` sẽ dùng các biến này để build, push image và deploy.

## 9. Checklist kiểm tra sau deploy

- `docker compose ps` phải thấy container `healthy` hoặc `running`
- `http://your-domain.com` mở được frontend
- `http://your-domain.com/api/...` trả API
- WebSocket `/ws` kết nối được
- Database dữ liệu vẫn còn sau restart container

## 10. Lưu ý quan trọng

- Không build image trên VPS.
- Không dùng `latest` cho production image.
- Không mở public port database.
- Database phải dùng volume.
- Secret chỉ để trong GitHub Secrets hoặc `.env` trên VPS.
