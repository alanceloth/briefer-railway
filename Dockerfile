# Use a imagem Docker-in-Docker para evitar configuração manual do Docker
FROM docker:latest

# Exponha a porta 3000 para a aplicação
EXPOSE 3000

# Comando para iniciar o Docker daemon e em seguida rodar o container "briefercloud/briefer"
CMD ["sh", "-c", "dockerd-entrypoint.sh & sleep 5 && docker run -d -p 3000:3000 -v briefer_psql_data:/var/lib/postgresql/data -v briefer_jupyter_data:/home/jupyteruser -v briefer_briefer_data:/home/briefer briefercloud/briefer && tail -f /dev/null"]
