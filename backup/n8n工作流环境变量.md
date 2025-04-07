```yaml
networks:
    1panel-network:
        external: true

services:
    n8n:
        container_name: ${CONTAINER_NAME}
        deploy:
            resources:
                limits:
                    cpus: ${CPUS}
                    memory: ${MEMORY_LIMIT}
        environment:
            - N8N_SECURE_COOKIE=false
            - N8N_HOST=n8n.geek.nyc.mn
            - N8N_PORT=5678
            - WEBHOOK_TUNNEL_URL=https://n8n.xxx.nyc.mn   # 确保使用正确的域名
            - VUE_APP_URL_BASE_API=https://n8n.xxx.nyc.mn # 确保使用正确的域名
            - N8N_PROTOCOL=https
            - N8N_EDITOR_BASE_URL=https://n8n.xxx.nyc.mn
        image: n8nio/n8n:1.86.0
        labels:
            createdBy: Apps
        networks:
            - 1panel-network
        restart: always
        volumes:
            - ./data:/home/node/.n8n
```