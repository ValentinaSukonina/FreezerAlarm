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

    // Handle FreezerAlreadyExistsException
    @ExceptionHandler(Exceptions.FreezerAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleFreezerAlreadyExistsException(Exceptions.FreezerAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    // Handle DataIntegrityViolationException
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String errorMessage = "Database constraint violation: " + extractConstraintViolationMessage(ex);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, errorMessage);
    }

    // Generic Exception Handler (Fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
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

