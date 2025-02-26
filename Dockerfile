# 使用轻量级的Nginx作为基础镜像
FROM nginx:alpine

# 将本地的HTML文件复制到容器中的Nginx默认网站目录
COPY main.html /usr/share/nginx/html/index.html

EXPOSE 80
