# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包含开发依赖）
RUN npm install

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 调试：打印 /app 目录的内容
RUN ls -la /app

# 生产阶段
FROM nginx:alpine

# 复制构建好的 Next.js 项目
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html

# 添加 Gzip 配置
RUN apk add --no-cache brotli && \
    rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80