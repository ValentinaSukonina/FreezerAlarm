package com.example.backend;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TestLombok {
    private Long id;
    private String name;

    public static void main(String[] args) {
        TestLombok test = new TestLombok();
        test.setId(1L); // Should compile without errors
        test.setName("Test Name"); // Should compile without errors
        System.out.println(test.getId());
        System.out.println(test.getName());
    }
}

