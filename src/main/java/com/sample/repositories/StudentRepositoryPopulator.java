package com.sample.repositories;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sample.domain.Student;
import org.springframework.beans.factory.BeanFactoryUtils;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.init.Jackson2ResourceReader;

import java.util.Collection;

public class StudentRepositoryPopulator implements ApplicationListener<ApplicationReadyEvent> {
    private final Jackson2ResourceReader resourceReader;
    private final Resource sourceData;

    public StudentRepositoryPopulator() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        resourceReader = new Jackson2ResourceReader(mapper);
        sourceData = new ClassPathResource("students.json");
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        CrudRepository studentRepository =
                BeanFactoryUtils.beanOfTypeIncludingAncestors(event.getApplicationContext(), CrudRepository.class);

        if (studentRepository != null && studentRepository.count() == 0) {
            populate(studentRepository);
        }
    }

    @SuppressWarnings("unchecked")
    private void populate(CrudRepository repository) {
        Object entity = getEntityFromResource(sourceData);

        if (entity instanceof Collection) {
            for (Student student : (Collection<Student>) entity) {
                if (student != null) {
                    repository.save(student);
                }
            }
        } else {
            repository.save(entity);
        }
    }

    private Object getEntityFromResource(Resource resource) {
        try {
            return resourceReader.readFrom(resource, this.getClass().getClassLoader());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
