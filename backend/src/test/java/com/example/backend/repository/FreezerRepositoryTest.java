package com.example.backend.repository;

import com.example.backend.entity.Freezer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class FreezerRepositoryTest {

    @Autowired
    private FreezerRepository freezerRepository;

/*    @Test
    @DisplayName("Freezer can be created and recalled")
    public void testFindByNumber() {
        Freezer freezer = new Freezer();
        freezer.setFile("file1");
        freezer.setNumber("1234");
        freezer.setAddress("123 Street");
        freezer.setRoom("RoomA");
        freezer.setType("TypeX");

        freezerRepository.save(freezer);

        Optional<Freezer> result = freezerRepository.findByNumber("1234");
        assertTrue(result.isPresent());
        assertEquals("1234", result.get().getNumber());
    }*/
}