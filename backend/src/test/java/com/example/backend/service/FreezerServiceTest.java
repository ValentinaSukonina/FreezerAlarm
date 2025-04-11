/*package com.example.backend.service;

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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
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
        freezer.setNumber("1111");

        when(freezerRepository.findByNumber("1111")).thenReturn(Optional.empty());
        when(freezerRepository.save(freezer)).thenReturn(freezer);

        Freezer saved = freezerService.createFreezer(freezer);
        assertEquals("1111", saved.getNumber());
    }

    @Test
    @DisplayName("Should throw exception when freezer exists")
    void createFreezer_duplicate() {
        Freezer freezer = new Freezer();
        freezer.setNumber("1111");

        when(freezerRepository.findByNumber("1111")).thenReturn(Optional.of(freezer));

        assertThrows(Exceptions.FreezerAlreadyExistsException.class, () -> freezerService.createFreezer(freezer));
    }

    @Test
    @DisplayName("Should find freezer by number with users")
    void findByNumberWithUsers_success() {
        Freezer freezer = new Freezer();
        freezer.setNumber("1111");

        when(freezerRepository.findByNumberWithUsers("1111")).thenReturn(freezer);
        when(freezerMapper.toFreezerWithUsersDTO(freezer)).thenReturn(
                new FreezerWithUsersDTO(1L, "", "1111", "", "", "", List.of(), List.of())
        );

        FreezerWithUsersDTO result = freezerService.findByNumberWithUsers("1111");

        assertEquals("1111", result.number());
    }

    @Test
    @DisplayName("Should throw when freezer not found (with users)")
    void findByNumberWithUsers_notFound() {
        when(freezerRepository.findByNumberWithUsers("999")).thenReturn(null);

        assertThrows(Exceptions.ResourceNotFoundException.class, () ->
                freezerService.findByNumberWithUsers("999"));
    }

    @Test
    @DisplayName("Should delete freezer by number")
    void deleteFreezerByNumber_success() {
        when(freezerRepository.deleteByNumber("123")).thenReturn(1);

        assertDoesNotThrow(() -> freezerService.deleteFreezerByNumber("123"));
    }

    @Test
    @DisplayName("Should throw when trying to delete non-existing freezer")
    void deleteFreezerByNumber_notFound() {
        when(freezerRepository.deleteByNumber("123")).thenReturn(0);

        assertThrows(Exceptions.ResourceNotFoundException.class, () ->
                freezerService.deleteFreezerByNumber("123"));
    }

    @Test
    @DisplayName("Should update freezer details by number")
    void updateFreezerDetailsByNumber_success() {
        Freezer freezer = new Freezer();
        freezer.setFile("file");
        freezer.setAddress("address");
        freezer.setRoom("room");
        freezer.setType("-80");
        freezer.setNumber("F123");

        when(freezerRepository.updateFreezerDetailsByNumber(
                eq("file"), eq("address"), eq("room"), eq("-80"), eq("F123"))).thenReturn(1);

        when(freezerRepository.findByNumber("F123")).thenReturn(Optional.of(freezer));
        when(freezerMapper.toFreezerDTO(freezer)).thenReturn(
                new FreezerDTO(1L, "file", "F123", "address", "room", "-80")
        );

        FreezerDTO result = freezerService.updateFreezerDetailsByNumber("F123", freezer);
        assertEquals("F123", result.number());
        assertEquals("address", result.address());
    }

    @Test
    @DisplayName("Should throw if freezer not found when updating")
    void updateFreezerDetailsByNumber_notFound() {
        Freezer freezer = new Freezer();
        freezer.setNumber("F404");

        when(freezerRepository.updateFreezerDetailsByNumber(any(), any(), any(), any(), any()))
                .thenReturn(0); // No rows updated

        assertThrows(Exceptions.ResourceNotFoundException.class,
                () -> freezerService.updateFreezerDetailsByNumber("F404", freezer));
    }

    @Test
    @DisplayName("Should create freezer with users")
    void createFreezerWithUsers_success() {
        Freezer freezerEntity = new Freezer();
        freezerEntity.setNumber("FX01");

        User user1 = new User();
        user1.setId(100L);

        Freezer savedFreezerWithUsers = new Freezer();
        savedFreezerWithUsers.setNumber("FX01");

        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                null, "", "FX01", "", "", "", List.of(100L), List.of()
        );

        when(freezerMapper.fromFreezerWithUsersDTO(dto)).thenReturn(freezerEntity);
        when(freezerRepository.save(freezerEntity)).thenReturn(freezerEntity);
        when(userRepository.findById(100L)).thenReturn(Optional.of(user1));
        when(freezerRepository.findByNumberWithUsers("FX01")).thenReturn(savedFreezerWithUsers);
        when(freezerMapper.toFreezerWithUsersDTO(savedFreezerWithUsers))
                .thenReturn(new FreezerWithUsersDTO(1L, "", "FX01", "", "", "", List.of(100L), List.of()));

        FreezerWithUsersDTO result = freezerService.createFreezerWithUsers(dto);
        assertEquals("FX01", result.number());
    }

    @Test
    @DisplayName("Should throw exception when freezer with users already exists")
    void createFreezerWithUsers_duplicate() {
        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                null, "", "DUPLICATE", "", "", "", List.of(), List.of()
        );

        when(freezerMapper.fromFreezerWithUsersDTO(dto)).thenReturn(new Freezer());
        when(freezerRepository.save(any())).thenThrow(DataIntegrityViolationException.class);

        assertThrows(Exceptions.FreezerAlreadyExistsException.class, () ->
                freezerService.createFreezerWithUsers(dto));
    }

    @Test
    @DisplayName("Should update freezer and associated users")
    void updateFreezerAndUsers_success() {
        Long freezerId = 1L;
        Long userId = 100L;

        Freezer existingFreezer = new Freezer();
        existingFreezer.setId(freezerId);
        existingFreezer.setNumber("OLD123");

        Freezer updatedFreezer = new Freezer();
        updatedFreezer.setId(freezerId);
        updatedFreezer.setNumber("NEW123");

        User user = new User();
        user.setId(userId);

        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                freezerId,
                "file1",
                "NEW123",
                "New Street",
                "Room 1",
                "-80",
                List.of(userId),
                List.of()
        );

        when(freezerRepository.findById(freezerId)).thenReturn(Optional.of(existingFreezer));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(freezerRepository.findByNumberWithUsers("NEW123")).thenReturn(updatedFreezer);
        when(freezerMapper.toFreezerWithUsersDTO(updatedFreezer)).thenReturn(dto);

        FreezerWithUsersDTO result = freezerService.updateFreezerAndUsers(freezerId, dto);

        assertEquals("NEW123", result.number());
        assertEquals("file1", result.file());
        assertEquals("Room 1", result.room());

        verify(freezerUserRepository).deleteByFreezer(existingFreezer);
        verify(freezerUserRepository).save(any(FreezerUser.class));
    }

    @Test
    @DisplayName("Should throw if freezer not found during update")
    void updateFreezerAndUsers_notFound() {
        Long freezerId = 1L;
        when(freezerRepository.findById(freezerId)).thenReturn(Optional.empty());

        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                freezerId, "", "F123", "", "", "", List.of(1L), List.of()
        );

        assertThrows(Exceptions.ResourceNotFoundException.class, () ->
                freezerService.updateFreezerAndUsers(freezerId, dto));
    }


}*/
