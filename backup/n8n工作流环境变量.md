### 环境变量
```yaml
services:
  n8n:
    image: n8nio/n8n:1.110.1
    container_name: ${CONTAINER_NAME}
    restart: always
    networks:
      - 1panel-network
    ports:
      - ${PANEL_APP_PORT_HTTP}:5678
    volumes:
      - ./data:/home/node/.n8n
    environment:
      N8N_SECURE_COOKIE=false
      WEBHOOK_URL=https://n8n.btw.pp.ua/
      N8N_EDITOR_BASE_URL=https://n8n.btw.pp.ua
      N8N_API_BASE_URL=https://n8n.btw.pp.ua
    labels:
      createdBy: "Apps"
networks:
  1panel-network:
    external: true
```