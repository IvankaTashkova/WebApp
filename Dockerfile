FROM adoptopenjdk/openjdk11
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","-Dspring.profiles.active=postgres","app.jar"]
