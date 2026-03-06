package com.bomunto.fileshared.domaine.identity.exception;

/**
 * Exception levée lorsque les identifiants fournis sont invalides lors de l'authentification.
 */
public class IdentifiantsInvalidesException extends RuntimeException {
    public IdentifiantsInvalidesException() {
        super("Identifiants invalides");
    }
}
