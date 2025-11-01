package com.example.backend.service;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.FreezerMapper;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FreezerServiceTest {

    @Mock
    private FreezerRepository freezerRepository;

    @Mock
    private FreezerUserRepository freezerUserRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FreezerMapper freezerMapper;

    @InjectMocks
    private FreezerService freezerService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should create a new freezer")
    void createFreezer_success() {
        Freezer freezer = new Freezer();
        freezer.setNumber(1111);

        when(freezerRepository.findByNumber(1111)).thenReturn(Optional.empty());
        when(freezerRepository.save(freezer)).thenReturn(freezer);

        Freezer saved = freezerService.createFreezer(freezer);

        assertEquals(1111, saved.getNumber());
    }

    @Test
    @DisplayName("Should throw exception when freezer exists")
    void createFreezer_duplicate() {
        Freezer freezer = new Freezer();
        freezer.setNumber(1111);

        when(freezerRepository.findByNumber(1111)).thenReturn(Optional.of(freezer));

        assertThrows(Exceptions.FreezerAlreadyExistsException.class, () -> freezerService.createFreezer(freezer));
    }

    @Test
    @DisplayName("Should find freezer by number with users")
    void findByNumberWithUsers_success() {
        Freezer freezer = new Freezer();
        freezer.setNumber(1111);

        when(freezerRepository.findByNumberWithUsers(1111)).thenReturn(freezer);
        when(freezerMapper.toFreezerWithUsersDTO(freezer)).thenReturn(
                new FreezerWithUsersDTO(1L, "", 1111, "", "", "", List.of(), List.of())
        );

        FreezerWithUsersDTO result = freezerService.findByNumberWithUsers(1111);

        assertEquals(1111, result.number());
    }

    @Test
    @DisplayName("Should throw when freezer not found (with users)")
    void findByNumberWithUsers_notFound() {
        when(freezerRepository.findByNumberWithUsers(999)).thenReturn(null);

        assertThrows(Exceptions.ResourceNotFoundException.class, () -> freezerService.findByNumberWithUsers(999));
    }

    @Test
    @DisplayName("Should return freezers for user id")
    void testGetFreezersByUserId() {
        // Arrange
        Long userId = 10L;

        List<FreezerDTO> mockFreezers = List.of(
                new FreezerDTO(1L, "File1", 1234, "Room A", "Address A", "-80"),
                new FreezerDTO(2L, "File2", 4567, "Room B", "Address B", "-20")
        );

        when(freezerUserRepository.findFreezersByUserId(userId))
                .thenReturn(mockFreezers);

        // Act
        List<FreezerDTO> result = freezerService.getFreezersByUserId(userId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(mockFreezers, result);

        verify(freezerUserRepository, times(1))
                .findFreezersByUserId(userId);
    }

    @Test
    @DisplayName("Should update freezer details by number")
    void updateFreezerDetailsByNumber_success() {
        Freezer freezer = new Freezer();
        freezer.setFile("file");
        freezer.setAddress("address");
        freezer.setRoom("room");
        freezer.setType("-80");
        freezer.setNumber(1234);

        when(freezerRepository.updateFreezerDetailsByNumber(eq("file"), eq("address"), eq("room"), eq("-80"), eq(1234))).thenReturn(1);
        when(freezerRepository.findByNumber(1234)).thenReturn(Optional.of(freezer));
        when(freezerMapper.toFreezerDTO(freezer)).thenReturn(
                new FreezerDTO(1L, "file", 1234, "address", "room", "-80")
        );

        FreezerDTO result = freezerService.updateFreezerDetailsByNumber(1234, freezer);

        assertEquals(1234, result.number());
        assertEquals("address", result.address());
    }

    @Test
    @DisplayName("Should throw if freezer not found when updating")
    void updateFreezerDetailsByNumber_notFound() {
        Freezer freezer = new Freezer();
        freezer.setNumber(1234);

        when(freezerRepository.updateFreezerDetailsByNumber(any(), any(), any(), any(), any()))
                .thenReturn(0); // No rows updated

        assertThrows(Exceptions.ResourceNotFoundException.class, () -> freezerService.updateFreezerDetailsByNumber(1234, freezer));
    }

    @Test
    @DisplayName("Should create freezer with users")
    void createFreezerWithUsers_success() {
        Freezer freezerEntity = new Freezer();
        freezerEntity.setNumber(1234);

        User user1 = new User();
        user1.setId(100L);

        Freezer savedFreezerWithUsers = new Freezer();
        savedFreezerWithUsers.setNumber(1234);

        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                null, "", 1234, "", "", "", List.of(100L), List.of()
        );

        when(freezerMapper.fromFreezerWithUsersDTO(dto)).thenReturn(freezerEntity);
        when(freezerRepository.save(freezerEntity)).thenReturn(freezerEntity);
        when(userRepository.findById(100L)).thenReturn(Optional.of(user1));
        when(freezerRepository.findByNumberWithUsers(1234)).thenReturn(savedFreezerWithUsers);
        when(freezerMapper.toFreezerWithUsersDTO(savedFreezerWithUsers))
                .thenReturn(new FreezerWithUsersDTO(1L, "", 1234, "", "", "", List.of(100L), List.of()));

        FreezerWithUsersDTO result = freezerService.createFreezerWithUsers(dto);

        assertEquals(1234, result.number());
    }

    @Test
    @DisplayName("Should throw exception when freezer with users already exists")
    void createFreezerWithUsers_duplicate() {
        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                null, "", 1234, "", "", "", List.of(), List.of()
        );

        when(freezerMapper.fromFreezerWithUsersDTO(dto)).thenReturn(new Freezer());
        when(freezerRepository.save(any())).thenThrow(DataIntegrityViolationException.class);

        assertThrows(Exceptions.FreezerAlreadyExistsException.class, () -> freezerService.createFreezerWithUsers(dto));
    }

    @Test
    @DisplayName("Should update freezer and associated users")
    void updateFreezerAndUsers_success() {
        Long freezerId = 1L;
        Long userId = 100L;

        Freezer existingFreezer = new Freezer();
        existingFreezer.setId(freezerId);
        existingFreezer.setNumber(1234);

        Freezer updatedFreezer = new Freezer();
        updatedFreezer.setId(freezerId);
        updatedFreezer.setNumber(1123);

        User user = new User();
        user.setId(userId);

        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                freezerId,
                "file1",
                1123,
                "New Street",
                "Room 1",
                "-80",
                List.of(userId),
                List.of()
        );

        when(freezerRepository.findById(freezerId)).thenReturn(Optional.of(existingFreezer));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(freezerRepository.findByNumberWithUsers(1123)).thenReturn(updatedFreezer);
        when(freezerMapper.toFreezerWithUsersDTO(updatedFreezer)).thenReturn(dto);

        FreezerWithUsersDTO result = freezerService.updateFreezerAndUsers(freezerId, dto);

        assertEquals(1123, result.number());
        assertEquals("file1", result.file());
        assertEquals("Room 1", result.room());

        verify(freezerRepository).save(existingFreezer);
        verify(freezerUserRepository).deleteByFreezer(existingFreezer);
        verify(freezerUserRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Should throw if freezer not found during update")
    void updateFreezerAndUsers_notFound() {
        Long freezerId = 1L;

        when(freezerRepository.findById(freezerId)).thenReturn(Optional.empty());

        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                freezerId, "", 1234, "", "", "", List.of(1L), List.of()
        );

        assertThrows(Exceptions.ResourceNotFoundException.class, () -> freezerService.updateFreezerAndUsers(freezerId, dto));
    }
}

