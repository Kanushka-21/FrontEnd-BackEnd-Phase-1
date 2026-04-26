# Backend Resources

This folder contains all resource files required by the application at runtime.

## Contents

### ML/AI Resources
- **haarcascade_frontalface_alt.xml** - OpenCV face detection classifier
  - Used by: `FaceRecognitionService`
  - Purpose: Detects human faces in uploaded images for user verification
  - Size: ~900KB
  - Format: OpenCV Haar Cascade XML
  - Reference: https://github.com/opencv/opencv/blob/master/data/haarcascades/

### Configuration Files
- **application.properties** - Spring Boot main configuration
- **application-dev.properties** - Development environment overrides
- **application-prod.properties** - Production environment overrides

## Spring Boot Configuration Priority

Spring Boot loads properties in this order (last wins):
1. Default: `application.properties`
2. Profile-specific: `application-{profile}.properties`
3. Environment variables
4. Command-line arguments

### Activate a Profile

Development:
```bash
java -Dspring.profiles.active=dev -jar app.jar
```

Production:
```bash
java -Dspring.profiles.active=prod -jar app.jar
```

## Docker Usage

These resources are automatically packaged into the JAR during Maven build. For Docker deployments:

- **Development**: Resources are accessed from the JAR file
- **Production**: If a file needs to be mounted separately, use volume mounts:
  ```yaml
  volumes:
    - ../src/main/resources/haarcascade_frontalface_alt.xml:/app/haarcascade_frontalface_alt.xml
  ```

## Adding New Resources

When adding new resource files (images, configs, data files):

1. Place them in `src/main/resources/`
2. Access them in Java:
   ```java
   InputStream is = getClass().getResourceAsStream("/filename.xml");
   ```
3. For files needed at classpath:
   ```java
   Resource resource = new ClassPathResource("filename.xml");
   ```

## File Organization

```
src/main/resources/
├── application.properties          (Base config)
├── application-dev.properties      (Dev overrides)
├── application-prod.properties     (Prod overrides)
├── haarcascade_frontalface_alt.xml (Face detection)
├── templates/                      (Thymeleaf templates if used)
├── static/                         (Static web files if served)
└── README.md                       (This file)
```

## Related Documentation

- See [Config/README.md](../../../Config/README.md) for environment configurations
- See [Docker/README.md](../../../Docker/README.md) for containerization
- See [Scripts/README.md](../../../Scripts/README.md) for build scripts
