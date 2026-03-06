package com.bomunto.fileshared.domaine.filesharing.exception;

/**
 * Exception levée lorsque l'utilisateur n'a pas les permissions nécessaires pour accéder à un fichier.
 */
public class AccesRefuseException extends RuntimeException {
    public AccesRefuseException() {
        super("Vous n'avez pas les permissions nécessaires pour accéder à ce fichier");
    }
}
