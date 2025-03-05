# start.sh
#!/bin/sh

# 启动 Node 服务（使用 PM2 管理进程）
pm2 start --no-daemon npm --name "nextjs" -- run start &

# 启动 Nginx
nginx -g 'daemon off;'
