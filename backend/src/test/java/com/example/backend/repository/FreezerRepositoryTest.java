package com.example.backend.repository;


import com.example.backend.entity.Freezer;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class FreezerRepositoryTest {

    @Autowired
    private FreezerRepository freezerRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    public void shouldFindAllWithUsers() {
        Freezer freezer = new Freezer(
                null,
                "file",
                "1111",
                "Addr",
                "Room",
                "-80",
                Set.of()
        );
        entityManager.persist(freezer);
        entityManager.flush();

        List<Freezer> freezers = freezerRepository.findAllWithUsers();
        assertFalse(freezers.isEmpty());
        assertEquals("1111", freezers.get(0).getNumber());
    }

    @Test
    public void shouldFindByNumber() {
        Freezer freezer = new Freezer(null, "file", "1234", "Addr", "Room", "-80", Set.of());
        entityManager.persist(freezer);
        entityManager.flush();

        Optional<Freezer> result = freezerRepository.findByNumber("1234");

        assertTrue(result.isPresent());
        assertEquals("1234", result.get().getNumber());
    }

    @Test
    public void shouldFindByNumberWithUsers() {
        Freezer freezer = new Freezer(null, "file", "5678", "Addr", "Room", "-80", Set.of());
        entityManager.persist(freezer);
        entityManager.flush();

        Freezer result = freezerRepository.findByNumberWithUsers("5678");

        assertNotNull(result);
        assertEquals("5678", result.getNumber());
    }

    @Test
    public void shouldUpdateFreezerDetailsByNumber() {
        Freezer freezer = new Freezer(null, "file", "8888", "Old Addr", "Room A", "-70", Set.of());
        entityManager.persist(freezer);
        entityManager.flush();

        int updated = freezerRepository.updateFreezerDetailsByNumber(
                "newFile.png", "New Addr", "Room B", "-60", "8888"
        );
        entityManager.clear(); // To force reload

        Freezer result = freezerRepository.findByNumber("8888").get();

        assertEquals(1, updated);
        assertEquals("New Addr", result.getAddress());
        assertEquals("Room B", result.getRoom());
        assertEquals("-60", result.getType());
    }

    @Test
    public void shouldDeleteByNumber() {
        Freezer freezer = new Freezer(null, "file", "9999", "Addr", "Room", "-80", Set.of());
        entityManager.persist(freezer);
        entityManager.flush();

        int deleted = freezerRepository.deleteByNumber("9999");

        assertEquals(1, deleted);
        assertFalse(freezerRepository.findByNumber("9999").isPresent());
    }



}

