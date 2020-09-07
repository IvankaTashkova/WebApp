package com.sample;

import com.sample.config.SpringApplicationContextInitializer;
import com.sample.repositories.StudentRepositoryPopulator;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        new SpringApplicationBuilder(Application.class)
                .initializers(new SpringApplicationContextInitializer())
                .listeners(new StudentRepositoryPopulator())
                .application()
                .run(args);
    }
}
