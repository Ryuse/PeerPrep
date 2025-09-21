package com.peerprep.microservices.matching.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class DefaultExceptionHandler {

  @ExceptionHandler(UserPreferenceNotFoundException.class)
  public ResponseEntity<String> handleUserPreferenceNotFound(UserPreferenceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
  }

  @ExceptionHandler(NoPendingMatchRequestException.class)
  public ResponseEntity<String> handleUserPreferenceNotFound(NoPendingMatchRequestException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
  }

  @ExceptionHandler(ExistingPendingMatchRequestException.class)
  public ResponseEntity<String> handleUserPreferenceNotFound(ExistingPendingMatchRequestException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<String> handleGeneralException(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("An unexpected error occurred: " + ex.getMessage());
  }
}
