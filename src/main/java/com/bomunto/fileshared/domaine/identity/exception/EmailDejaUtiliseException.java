package com.bomunto.fileshared.domaine.identity.exception;

/**
 * Exception levée lorsqu'un utilisateur tente de s'enregistrer avec une adresse email déjà utilisée.
 */
public class EmailDejaUtiliseException extends RuntimeException {
    public EmailDejaUtiliseException(String email) {
        super("Un compte avec l'email " + email + " existe déjà");
    }
}
