# Use uma imagem base do Ubuntu
FROM ubuntu:latest

# Instale pacotes necessários e Docker
RUN apt-get update && \
    apt-get install -y \
    curl \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io

# Exponha a porta 3000
EXPOSE 3000

# Inicie o Docker daemon e execute o container `briefercloud/briefer`
CMD service docker start && \
    docker run -d -p 3000:3000 -v briefer_psql_data:/var/lib/postgresql/data -v briefer_jupyter_data:/home/jupyteruser -v briefer_briefer_data:/home/briefer briefercloud/briefer && \
    tail -f /dev/null  # Mantém o container em execução
