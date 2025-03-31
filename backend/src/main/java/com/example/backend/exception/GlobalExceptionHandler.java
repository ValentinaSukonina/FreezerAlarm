package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle NotFoundException (Returns 404)
    @ExceptionHandler(Exceptions.NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(Exceptions.NotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(Exceptions.ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(Exceptions.ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // Handle FreezerAlreadyExistsException (409 Conflict)
    @ExceptionHandler(Exceptions.FreezerAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleFreezerAlreadyExistsException(Exceptions.FreezerAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(Exceptions.FreezerUserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleFreezerUserAlreadyExistsException(Exceptions.FreezerUserAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    // Handle UserAlreadyExistsException (409 Conflict)
    @ExceptionHandler(Exceptions.UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExistsException(Exceptions.UserAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    // Handle DataIntegrityViolationException (400 Bad Request)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String errorMessage = "Database constraint violation: " + extractConstraintViolationMessage(ex);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, errorMessage);
    }

    // Generic Exception Handler (Fallback for unexpected errors)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
    }

    public class BadRequestException extends RuntimeException {
        public BadRequestException(String message) {
            super(message);
        }
    }

    // Helper Method to Build Error Response
    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        return new ResponseEntity<>(response, status);
    }

    // Helper to Extract Detailed Constraint Violation Messages
    private String extractConstraintViolationMessage(DataIntegrityViolationException ex) {
        Throwable rootCause = ex.getRootCause();
        return (rootCause != null && rootCause.getMessage() != null) ? rootCause.getMessage() : "Unknown database constraint violation";
    }
}
