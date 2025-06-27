FROM ubuntu:22.04

WORKDIR /app

RUN apt update && \
    apt install -y curl unzip libcurl4-openssl-dev libssl-dev libncurses5 libstdc++6 && \
    apt clean

# Copy and unzip the Bedrock server ZIP
COPY bedrock-server.zip .
RUN unzip bedrock-server.zip && chmod +x bedrock_server

# ✅ Copy everything from /server (server.properties, world, permissions.json, etc.)
COPY server/ ./

EXPOSE 19132/udp

CMD ["./bedrock_server"]
