FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/agroflex-notifications-service-1.0.0.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "app.jar"]
