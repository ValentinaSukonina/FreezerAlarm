package com.example.backend.mapper;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class UserMapperTest {

    private final UserMapper mapper = new UserMapper();

    @Test
    void testToUserDTO() {
        User user = new User();
        user.setId(1L);
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setPhoneNumber("0701234567");
        user.setUser_rank(1);
        user.setRole("user");

        UserDTO dto = mapper.toUserDTO(user);

        assertNotNull(dto);
        assertEquals(1L, dto.id());
        assertEquals("Alice", dto.name());
        assertEquals("alice@example.com", dto.email());
        assertEquals("0701234567", dto.phone_number());
        assertEquals(1, dto.user_rank());
        assertEquals("user", dto.role());
    }

    @Test
    void testToUserDTO_NullInputReturnsNull() {
        assertNull(mapper.toUserDTO(null));
    }

    @Test
    void testToUserDTOList() {
        User user1 = new User();
        user1.setId(1L);
        user1.setName("Anna");
        user1.setEmail("anna@example.com");
        user1.setPhoneNumber("0700000001");
        user1.setUser_rank(2);
        user1.setRole("user");

        User user2 = new User();
        user2.setId(2L);
        user2.setName("Bob");
        user2.setEmail("bob@example.com");
        user2.setPhoneNumber("0700000002");
        user2.setUser_rank(1);
        user2.setRole("admin");

        List<UserDTO> dtoList = mapper.toUserDTOList(List.of(user1, user2));

        assertEquals(2, dtoList.size());
        assertEquals("Anna", dtoList.get(0).name());
        assertEquals("Bob", dtoList.get(1).name());
    }

    @Test
    void testToUserDTOList_EmptyListReturnsEmpty() {
        List<UserDTO> dtoList = mapper.toUserDTOList(List.of());
        assertNotNull(dtoList);
        assertTrue(dtoList.isEmpty());
    }
}