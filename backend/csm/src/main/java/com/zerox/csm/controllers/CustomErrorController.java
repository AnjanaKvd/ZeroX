package com.zerox.csm.controllers;

import com.zerox.csm.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request) {
        HttpStatus status = getStatus(request);
        
        if (isApiRequest(request)) {
            return handleApiError(request, status);
        }
        
        // For HTML views
        return "error/" + status.value();
    }
    
    @GetMapping(value = "/error/404", produces = MediaType.TEXT_HTML_VALUE)
    public String notFoundPage() {
        return "error/404";
    }
    
    @GetMapping(value = "/error/500", produces = MediaType.TEXT_HTML_VALUE)
    public String serverErrorPage() {
        return "error/500";
    }
    
    @GetMapping(value = "/error/403", produces = MediaType.TEXT_HTML_VALUE)
    public String forbiddenPage() {
        return "error/403";
    }
    
    @GetMapping(value = "/error/401", produces = MediaType.TEXT_HTML_VALUE)
    public String unauthorizedPage() {
        return "error/401";
    }
    
    @ResponseBody
    private ResponseEntity<ErrorResponse> handleApiError(HttpServletRequest request, HttpStatus status) {
        String message = getErrorMessage(status);
        
        ErrorResponse errorResponse = new ErrorResponse(
                status.value(),
                message,
                LocalDateTime.now()
        );
        
        return new ResponseEntity<>(errorResponse, status);
    }
    
    private boolean isApiRequest(HttpServletRequest request) {
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains(MediaType.APPLICATION_JSON_VALUE);
    }
    
    private HttpStatus getStatus(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        if (statusCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        try {
            return HttpStatus.valueOf(statusCode);
        } catch (Exception ex) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
    
    private String getErrorMessage(HttpStatus status) {
        switch (status) {
            case NOT_FOUND:
                return "The requested resource was not found";
            case FORBIDDEN:
                return "You don't have permission to access this resource";
            case UNAUTHORIZED:
                return "Authentication is required to access this resource";
            case INTERNAL_SERVER_ERROR:
                return "An unexpected server error occurred";
            default:
                return "An error occurred";
        }
    }
} 