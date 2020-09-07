package com.sample.web;

import com.sample.domain.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping(value = "/students")
public class StudentController {
    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);
    private CrudRepository<Student, String> repository;

    @Autowired
    public StudentController(CrudRepository<Student, String> repository) {
        this.repository = repository;
    }

    @RequestMapping(method = RequestMethod.GET)
    public Iterable<Student> students() {
        return repository.findAll();
    }

    @RequestMapping(method = RequestMethod.PUT)
    public Student add(@RequestBody @Valid Student student) {
        logger.info("Adding student " + student.getId());
        return repository.save(student);
    }

    @RequestMapping(method = RequestMethod.POST)
    public Student update(@RequestBody @Valid Student student) {
        logger.info("Updating student " + student.getId());
        return repository.save(student);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public Student getById(@PathVariable String id) {
        logger.info("Getting student " + id);
        return repository.findById(id).orElse(null);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void deleteById(@PathVariable String id) {
        logger.info("Deleting student " + id);
        repository.deleteById(id);
    }
}