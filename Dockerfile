# 使用官方 Transmission 镜像作为基础
FROM linuxserver/transmission:latest

# 维护者信息
LABEL maintainer="bitcake"
LABEL description="Transmission with BitCake - A modern Vue.js WebUI"

# 备份原始 WebUI（可选）
RUN if [ -d /usr/share/transmission/public_html ]; then \
      mv /usr/share/transmission/public_html /usr/share/transmission/public_html.bak; \
    fi

# 复制构建好的 WebUI 文件到 Transmission 的 web 目录
# linuxserver/transmission 使用 /usr/share/transmission/public_html 作为 WebUI 目录
COPY dist-transmission/ /usr/share/transmission/public_html/

# 设置正确的权限
RUN chown -R abc:abc /usr/share/transmission/public_html && \
    chmod -R 755 /usr/share/transmission/public_html

# 暴露端口（继承自基础镜像）
# 9091: WebUI
# 51413: Peer port
EXPOSE 9091 51413 51413/udp

# 使用基础镜像的启动命令
