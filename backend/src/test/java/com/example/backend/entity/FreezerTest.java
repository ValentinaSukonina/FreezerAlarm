package com.example.backend.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FreezerTest {
    private Freezer freezer1;
    private Freezer freezer2;
    private Freezer freezer3;
    @BeforeEach
    void setUp() {
        freezer1 = new Freezer(1L, "bygg 1", "1111", "Medicinaregatan 9", "1310C", "-80C", null);
        freezer2 = new Freezer(1L, "bygg 1", "1111", "Medicinaregatan 9", "1310C", "-80C", null);
        freezer3 = new Freezer(2L, "bygg 1", "2222", "Medicinaregatan 9", "1310C", "-150C", null);
    }

    @Test
    void testEquals_SameId_ShouldBeEqual() {
        assertEquals(freezer1, freezer2, "Freezers with the same ID should be equal");
    }

    @Test
    void testEquals_DifferentId_ShouldNotBeEqual() {
        assertNotEquals(freezer1, freezer3, "Freezers with different IDs should not be equal");
    }

    @Test
    void testSameObject_ShouldBeEqual() {
        assertEquals(freezer1, freezer1, "An object should be equal to itself");
    }

    @Test
    void testHashCode_SameClass_ShouldBeEqual() {
        assertEquals(freezer1.hashCode(), freezer2.hashCode(), "Hash codes should be the same for objects with the same ID");
    }

    @Test
    void testHashCode_DifferentClass_ShouldNotBeEqual() {
        Object notAFreezer = new Object();
        assertNotEquals(freezer1.hashCode(), notAFreezer.hashCode(), "Hash codes should be different for different classes");
    }

    @Test
    void testSettersAndGetters() {
        Freezer freezer = new Freezer();

        freezer.setId(10L);
        freezer.setFile("bygg 10");
        freezer.setNumber("1234");
        freezer.setAddress("Testgatan 5");
        freezer.setRoom("1400A");
        freezer.setType("-20C");

        // Validating values with getters
        assertEquals(10L, freezer.getId(), "ID should be set correctly");
        assertEquals("bygg 10", freezer.getFile(), "File should be set correctly");
        assertEquals("1234", freezer.getNumber(), "Number should be set correctly");
        assertEquals("Testgatan 5", freezer.getAddress(), "Address should be set correctly");
        assertEquals("1400A", freezer.getRoom(), "Room should be set correctly");
        assertEquals("-20C", freezer.getType(), "Type should be set correctly");
    }
}