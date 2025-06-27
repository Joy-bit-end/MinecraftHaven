FROM ubuntu:22.04

WORKDIR /app

RUN apt update && \
    apt install -y curl unzip libcurl4-openssl-dev libssl-dev libncurses5 libstdc++6 && \
    apt clean

COPY bedrock-server.zip .

RUN unzip bedrock-server.zip && \
    chmod +x bedrock_server

# ✅ Copy server.properties from /server folder in repo
COPY server/server.properties ./server.properties

EXPOSE 19132/udp

CMD ["./bedrock_server"]
