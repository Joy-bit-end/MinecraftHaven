FROM ubuntu:22.04

WORKDIR /app

RUN apt update &&     apt install -y curl unzip libcurl4-openssl-dev libssl-dev libncurses5 libstdc++6 &&     apt clean

COPY bedrock-server-1.21.92.1.zip .

RUN unzip bedrock-server-1.21.92.1.zip &&     chmod +x bedrock_server

EXPOSE 19132/udp

CMD ["./bedrock_server"]
