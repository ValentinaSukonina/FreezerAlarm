package com.example.backend.mapper;

import com.example.backend.dto.FreezerUserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FreezerUserMapperTest {

    private final FreezerUserMapper mapper = new FreezerUserMapper();

    @Test
    void testToDTO() {
        Freezer freezer = new Freezer();
        freezer.setId(1L);

        User user = new User();
        user.setId(2L);

        FreezerUser freezerUser = new FreezerUser();
        freezerUser.setId(100L);
        freezerUser.setUser(user);
        freezerUser.setFreezer(freezer);

        FreezerUserDTO dto = mapper.toDTO(freezerUser);

        assertNotNull(dto);
        assertEquals(100L, dto.id());
        assertEquals(2L, dto.userId());
        assertEquals(1L, dto.freezerId());
    }

    @Test
    void testToDTO_NullInputReturnsNull() {
        assertNull(mapper.toDTO(null));
    }

    @Test
    void testFromDTO() {
        FreezerUserDTO dto = new FreezerUserDTO(101L, 2L, 1L);

        User user = new User();
        user.setId(2L);

        Freezer freezer = new Freezer();
        freezer.setId(1L);

        FreezerUser entity = mapper.fromDTO(dto, user, freezer);

        assertNotNull(entity);
        assertEquals(101L, entity.getId());
        assertEquals(2L, entity.getUser().getId());
        assertEquals(1L, entity.getFreezer().getId());
    }

    @Test
    void testFromDTO_NullArgumentsReturnNull() {
        FreezerUserDTO dto = new FreezerUserDTO(1L, 2L, 3L);
        User user = new User();
        Freezer freezer = new Freezer();

        assertNull(mapper.fromDTO(null, user, freezer));
        assertNull(mapper.fromDTO(dto, null, freezer));
        assertNull(mapper.fromDTO(dto, user, null));
    }
}