package com.example.backend.service;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringJUnitConfig
public class UserServiceTest {

    @Mock
    private FreezerUserRepository freezerUserRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserDTO userDTO;

    @BeforeEach
    public void setUp() {
        user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setEmail("john@example.com");
        user.setPhoneNumber("123456789");
        user.setUser_rank(1);
        user.setRole("user");

        userDTO = new UserDTO(1L, "John Doe", "123456789", "john@example.com", 1, "user");
    }

    @Test
    @DisplayName("Test creating a user")
    public void testCreateUser() {
        when(userRepository.save(user)).thenReturn(user);

        User createdUser = userService.createUser(user);

        assertNotNull(createdUser);
        assertEquals("John Doe", createdUser.getName());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Test deleting a user")
    public void testDeleteUser() {
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteUser(1L);

        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Test deleting a user by ID (when freezer bindings are present)")
    public void testDeleteUserById() {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(freezerUserRepository).deleteByUserId(1L);
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteUserById(1L);

        verify(freezerUserRepository, times(1)).deleteByUserId(1L);
        verify(userRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Test updating a user")
    public void testUpdateUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User updatedUser = userService.updateUser(1L, user);

        assertNotNull(updatedUser);
        assertEquals("John Doe", updatedUser.getName());
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Test getting a user by ID")
    public void testGetUserById() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userMapper.toUserDTO(user)).thenReturn(userDTO);

        UserDTO fetchedUser = userService.getUserById(1L);

        assertNotNull(fetchedUser);
        assertEquals("John Doe", fetchedUser.name());  // Use 'name()' instead of 'getName()' for records
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test getting all users")
    public void testGetAllUsers() {
        List<User> users = Arrays.asList(user);
        when(userRepository.findAll()).thenReturn(users);
        when(userMapper.toUserDTOList(users)).thenReturn(Arrays.asList(userDTO));

        List<UserDTO> userList = userService.getAllUsers();

        assertNotNull(userList);
        assertEquals(1, userList.size());
        assertEquals("John Doe", userList.get(0).name());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Test getting all users - exception")
    public void testGetAllUsers_Exception() {
        when(userRepository.findAll()).thenThrow(new RuntimeException("No users found"));

        Exception exception = assertThrows(RuntimeException.class, () -> userService.getAllUsers());

        assertEquals("No users found", exception.getMessage());
    }

    @Test
    @DisplayName("Test finding user by name")
    public void testFindByName() {
        when(userRepository.findByName("John Doe")).thenReturn(Optional.of(user));

        Optional<User> fetchedUser = userService.findByName("John Doe");

        assertTrue(fetchedUser.isPresent());
        assertEquals("John Doe", fetchedUser.get().getName());
    }

    @Test
    @DisplayName("Test finding user by name - user not found")
    public void testFindByName_UserNotFound() {
        when(userRepository.findByName("Jane Doe")).thenReturn(Optional.empty());

        Optional<User> fetchedUser = userService.findByName("Jane Doe");

        assertFalse(fetchedUser.isPresent());
    }

    @Test
    @DisplayName("Test updating user - exception")
    public void testUpdateUser_Exception() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(Exceptions.ResourceNotFoundException.class, () -> userService.updateUser(1L, user));

        assertEquals("User with id 1 not found", exception.getMessage());
    }




}

