package com.bomunto.fileshared.domaine.filesharing.exception;

/**
 * Exception levée lorsque le lien de partage d'un fichier a expiré.
 */
public class LienExpireException extends RuntimeException {
    public LienExpireException() {
        super("Le lien de partage a expiré et n'est plus valide");
    }
}
