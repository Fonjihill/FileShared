package com.bomunto.fileshared.infrastructure.web.common.exception;

import com.bomunto.fileshared.domaine.filesharing.exception.AccesRefuseException;
import com.bomunto.fileshared.domaine.filesharing.exception.FichierIntrouvableException;
import com.bomunto.fileshared.domaine.filesharing.exception.LienExpireException;
import com.bomunto.fileshared.domaine.identity.exception.EmailDejaUtiliseException;
import com.bomunto.fileshared.domaine.identity.exception.IdentifiantsInvalidesException;
import com.bomunto.fileshared.infrastructure.web.common.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailDejaUtiliseException.class)
    public ResponseEntity<ErrorResponse> handleEmailDejaUtilise(EmailDejaUtiliseException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(IdentifiantsInvalidesException.class)
    public ResponseEntity<ErrorResponse> handleIdentifiantsInvalides(IdentifiantsInvalidesException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(FichierIntrouvableException.class)
    public ResponseEntity<ErrorResponse> handleFichierIntrouvable(FichierIntrouvableException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(AccesRefuseException.class)
    public ResponseEntity<ErrorResponse> handleAccesRefuse(AccesRefuseException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(LienExpireException.class)
    public ResponseEntity<ErrorResponse> handleLienExpire(LienExpireException ex) {
        return ResponseEntity.status(HttpStatus.GONE)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " : " + error.getDefaultMessage())
                .reduce((a, b) -> a + ", " + b)
                .orElse("Erreur de validation");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(message));
    }
}
