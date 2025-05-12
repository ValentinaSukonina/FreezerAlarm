package com.example.backend.mapper;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FreezerMapperTest {

    private final FreezerMapper mapper = new FreezerMapper();

    @Test
    void testToFreezerDTO() {
        Freezer freezer = new Freezer();
        freezer.setId(1L);
        freezer.setFile("bygg1");
        freezer.setNumber("1111");
        freezer.setAddress("Medicinaregatan 9");
        freezer.setRoom("101A");
        freezer.setType("-80C");

        FreezerDTO dto = mapper.toFreezerDTO(freezer);

        assertNotNull(dto);
        assertEquals(1L, dto.id());
        assertEquals("bygg1", dto.file());
        assertEquals("1111", dto.number());
        assertEquals("Medicinaregatan 9", dto.address());
        assertEquals("101A", dto.room());
        assertEquals("-80C", dto.type());
    }

    @Test
    void testToFreezerWithUsersDTO_sortsByRank() {
        User user1 = new User();
        user1.setId(10L);
        user1.setName("Anna");
        user1.setEmail("anna@example.com");
        user1.setPhoneNumber("0701111111");
        user1.setRole("user");
        user1.setUser_rank(2);

        User user2 = new User();
        user2.setId(20L);
        user2.setName("Bob");
        user2.setEmail("bob@example.com");
        user2.setPhoneNumber("0702222222");
        user2.setRole("user");
        user2.setUser_rank(1);

        FreezerUser fu1 = new FreezerUser();
        fu1.setUser(user1);
        FreezerUser fu2 = new FreezerUser();
        fu2.setUser(user2);

        Freezer freezer = new Freezer();
        freezer.setId(5L);
        freezer.setFile("test.pdf");
        freezer.setNumber("1111");
        freezer.setAddress("Building A");
        freezer.setRoom("A101");
        freezer.setType("-80C");
        freezer.setFreezerUsers(Set.of(fu1, fu2));

        FreezerWithUsersDTO dto = mapper.toFreezerWithUsersDTO(freezer);

        assertNotNull(dto);
        assertEquals(5L, dto.id());
        assertEquals("1111", dto.number());
        assertEquals(2, dto.users().size());
        assertEquals("Bob", dto.users().get(0).name()); // rank 1
        assertEquals("Anna", dto.users().get(1).name()); // rank 2
    }

    @Test
    void testFromFreezerWithUsersDTO() {
        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                9L,
                "doc.pdf",
                "2222",
                "Science Park",
                "1310",
                "-150C",
                List.of(1L, 2L),
                List.of()
        );

        Freezer entity = mapper.fromFreezerWithUsersDTO(dto);

        assertNotNull(entity);
        assertEquals(9L, entity.getId());
        assertEquals("doc.pdf", entity.getFile());
        assertEquals("2222", entity.getNumber());
        assertEquals("Science Park", entity.getAddress());
        assertEquals("1310", entity.getRoom());
        assertEquals("-150C", entity.getType());
    }

    @Test
    void testNullInputsReturnNull() {
        assertNull(mapper.toFreezerDTO(null));
        assertNull(mapper.toFreezerWithUsersDTO(null));
        assertNull(mapper.fromFreezerWithUsersDTO(null));
    }
}