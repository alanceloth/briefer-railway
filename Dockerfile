# Use a imagem base do Python
FROM python:3.10-slim

# Instale dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instale o Docker CLI para que o Briefer possa utilizá-lo
RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
RUN dockerd-rootless-setuptool.sh install

# Configure o diretório de trabalho
WORKDIR /app

# Instale o Briefer usando pip
RUN pip install --no-cache-dir briefer

# Exponha a porta que o Briefer usará
EXPOSE 3000

# Comando para iniciar o Briefer
CMD ["briefer"]
