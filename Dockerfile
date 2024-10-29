# Use uma imagem base do Python
FROM python:3.10-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instala o Docker CLI para que o Briefer possa utilizá-lo
RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Instala o Briefer e outras dependências
RUN pip install --no-cache-dir briefer docker requests

# Define a pasta de trabalho
WORKDIR /app

# Copia o script de inicialização se houver
COPY . /app

# Exponha a porta que o Briefer usará
EXPOSE 3000

# Define variáveis de ambiente (adicione ou remova conforme necessário)
ENV LOG_LEVEL="info" \
    ALLOW_HTTP="true" \
    POSTGRES_USERNAME="username" \
    POSTGRES_PASSWORD="password" \
    POSTGRES_HOSTNAME="hostname" \
    POSTGRES_PORT="5432" \
    POSTGRES_DATABASE="database" \
    AI_API_URL="http://ai_api_url" \
    AI_API_USERNAME="ai_username" \
    AI_API_PASSWORD="ai_password" \
    JUPYTER_HOST="localhost" \
    JUPYTER_PORT="8888" \
    JUPYTER_TOKEN="jupyter_token"

# Configura o contêiner para executar o comando Briefer
CMD ["briefer"]
