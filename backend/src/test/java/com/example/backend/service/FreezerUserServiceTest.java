/*package com.example.backend.service;



import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.FreezerMapper;
import com.example.backend.mapper.FreezerUserMapper;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FreezerUserServiceTest {

    private FreezerUserRepository freezerUserRepository;
    private FreezerRepository freezerRepository;
    private UserRepository userRepository;
    private UserMapper userMapper;
    private FreezerMapper freezerMapper;
    private FreezerUserMapper freezerUserMapper;

    private FreezerUserService freezerUserService;

    @BeforeEach
    void setUp() {
        freezerUserRepository = mock(FreezerUserRepository.class);
        freezerRepository = mock(FreezerRepository.class);
        userRepository = mock(UserRepository.class);
        userMapper = mock(UserMapper.class);
        freezerMapper = mock(FreezerMapper.class);
        freezerUserMapper = mock(FreezerUserMapper.class);

        freezerUserService = new FreezerUserService(freezerUserRepository, freezerRepository, userRepository, userMapper, freezerUserMapper, freezerMapper);
    }

    @Test
    void bindUserToFreezer_success() {
        User user = new User();
        Freezer freezer = new Freezer();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(freezerRepository.findById(2L)).thenReturn(Optional.of(freezer));
        when(freezerUserRepository.existsByUserIdAndFreezerId(1L, 2L)).thenReturn(false);

        FreezerUser freezerUser = new FreezerUser();
        when(freezerUserRepository.save(any())).thenReturn(freezerUser);

        FreezerUser result = freezerUserService.bindUserToFreezer(1L, 2L);

        assertNotNull(result);
        verify(freezerUserRepository).save(any());
    }

    @Test
    void bindUserToFreezer_duplicate() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(freezerRepository.findById(2L)).thenReturn(Optional.of(new Freezer()));
        when(freezerUserRepository.existsByUserIdAndFreezerId(1L, 2L)).thenReturn(true);

        assertThrows(Exceptions.FreezerUserAlreadyExistsException.class,
                () -> freezerUserService.bindUserToFreezer(1L, 2L));
    }

    @Test
    void unbindUserFromFreezer_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(freezerRepository.findById(2L)).thenReturn(Optional.of(new Freezer()));
        when(freezerUserRepository.deleteByFreezerAndUser(any(), any())).thenReturn(1);

        assertDoesNotThrow(() -> freezerUserService.unbindUserFromFreezer(1L, 2L));
    }

    @Test
    void updateFreezerUser_success() {
        User user = new User();
        Freezer oldFreezer = new Freezer();
        Freezer newFreezer = new Freezer();
        FreezerUser existing = new FreezerUser();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(freezerRepository.findById(2L)).thenReturn(Optional.of(oldFreezer));
        when(freezerRepository.findById(3L)).thenReturn(Optional.of(newFreezer));
        when(freezerUserRepository.findByFreezerAndUser(oldFreezer, user)).thenReturn(Optional.of(existing));
        when(freezerUserRepository.save(any())).thenReturn(existing);

        FreezerUser result = freezerUserService.updateFreezerUser(1L, 2L, 3L);
        assertEquals(existing, result);
    }

    @Test
    void getFreezersByUserId_noFreezers() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(freezerUserRepository.findByUserId(1L)).thenReturn(List.of());

        assertThrows(Exceptions.ResourceNotFoundException.class,
                () -> freezerUserService.getFreezersByUserId(1L));
    }

    @Test
    void updateFreezerUserAssignments_success() {
        Freezer freezer = new Freezer();
        freezer.setId(1L);
        User user = new User();
        user.setId(2L);

        when(freezerRepository.findById(1L)).thenReturn(Optional.of(freezer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        freezerUserService.updateFreezerUserAssignments(1L, List.of(2L));

        verify(freezerUserRepository).deleteByFreezer(freezer);
        verify(freezerUserRepository).save(any(FreezerUser.class));
    }
}*/
