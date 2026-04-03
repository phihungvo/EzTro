# Stage 1: Build JAR
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY . .

# RUN ./mvnw clean package -DskipTests
RUN ./mvnw clean package -Dmaven.test.skip=true

# Stage 2: Run JAR
FROM eclipse-temurin:21-jre

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
