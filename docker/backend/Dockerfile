FROM eclipse-temurin:21-jre

WORKDIR /app

ARG JAR_FILE=ez_tro_api/target/*.jar

RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY ${JAR_FILE} app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
