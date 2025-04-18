### Cloudflare tunnel
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
          - N8N_HOST=n8n.xxx.nyc.mn
          - N8N_PORT=5678
          - N8N_PROTOCOL=https
          - N8N_EDITOR_BASE_URL=https://n8n.xxx.nyc.mn
          - N8N_API_BASE_URL=https://n8n.xxx.nyc.mn
        image: n8nio/n8n:1.86.0
        labels:
            createdBy: Apps
        networks:
            - 1panel-network
        ports:
            - ${HOST_IP}:${PANEL_APP_PORT_HTTP}:5678
        restart: always
        volumes:
            - ./data:/home/node/.n8n
```

### Nginx 反代
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
        image: n8nio/n8n:1.86.0
        labels:
            createdBy: Apps
        networks:
            - 1panel-network
        ports:
            - ${HOST_IP}:${PANEL_APP_PORT_HTTP}:5678
        restart: always
        volumes:
            - ./data:/home/node/.n8n
        environment:
            - N8N_SECURE_COOKIE=false
            - N8N_PORT=5678
            - N8N_HOST=n8n.xxx.nyc.mn
            - WEBHOOK_TUNNEL_URL=https://n8n.xxx.nyc.mn
            - VUE_APP_URL_BASE_API=https://n8n.xxx.nyc.mn
            - N8N_EDITOR_BASE_URL=https://n8n.xxx.nyc.mn
            - N8N_PROTOCOL=https
```