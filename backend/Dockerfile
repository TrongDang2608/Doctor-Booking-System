# Build stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 7070

# Environment variables will be overridden by docker-compose
ENV DB_URL=jdbc:mysql://localhost:3306/doctor_booking
ENV DB_USERNAME=root
ENV DB_PASSWORD=root

ENTRYPOINT ["java", "-jar", "app.jar"]
