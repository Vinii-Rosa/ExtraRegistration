#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env criado a partir de .env.example"
fi

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

if [ -z "$API_PORT" ]; then
  running_port=$(docker port extra_hour 3001/tcp 2>/dev/null | head -n1 | sed 's/.*://')
  if [ -n "$running_port" ]; then
    API_PORT=$running_port
  else
    API_PORT=3001
    while port_in_use "$API_PORT"; do
      echo "Porta $API_PORT em uso, tentando $((API_PORT + 1))"
      API_PORT=$((API_PORT + 1))
    done
  fi
fi
export API_PORT

docker compose up -d --build
echo "API disponível em http://localhost:$API_PORT"
