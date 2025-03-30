package com.zerox.csm.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ValidationErrorResponse extends ErrorResponse {
    private final Map<String, String> errors;

    public ValidationErrorResponse(int status, String message, LocalDateTime timestamp, Map<String, String> errors) {
        super(status, message, timestamp);
        this.errors = errors;
    }

    // Rename the method to avoid overriding the parent's getErrors() method
    public Map<String, String> getValidationErrors() {
        return errors;
    }
}
