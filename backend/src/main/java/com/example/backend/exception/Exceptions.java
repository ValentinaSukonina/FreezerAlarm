package com.example.backend.exception;

public class Exceptions {
    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) {
            super(message);
        }
    }

    public static class FreezerAlreadyExistsException extends RuntimeException {
        public FreezerAlreadyExistsException(String message) {
            super(message);
        }
    }

    public static class InternalServerErrorException extends RuntimeException {
        public InternalServerErrorException(String message) {
            super(message);
        }
    }

}