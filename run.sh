#!/bin/bash

# chmod +x run.sh
# ./run.sh

# Start Spring Boot backend
echo "Starting Spring Boot backend..."
cd tevc_cms_api
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait a few seconds for backend to fully start
echo "Waiting for backend to be ready..."
sleep 10

# Start React frontend
echo "Starting React frontend..."
cd tevc_cms_app
npm start

# Optional: stop backend when frontend ends
kill $BACKEND_PID

#!/bin/bash
docker run --rm -v "$PWD":/app -w /app node:18 bash -c "npm install && npm run build"

# RUN
# chmod +x run.sh
# ./run.sh
