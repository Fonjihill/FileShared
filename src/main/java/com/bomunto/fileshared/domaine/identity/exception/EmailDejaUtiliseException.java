package com.bomunto.fileshared.domaine.identity.exception;

public class EmailDejaUtiliseException extends RuntimeException {
    public EmailDejaUtiliseException(String email) {
        super("Un compte avec l'email " + email + " existe déjà");
    }
}
