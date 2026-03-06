package com.bomunto.fileshared.domaine.filesharing.exception;

import java.util.UUID;

/**
 * Exception levée lorsque le fichier demandé est introuvable ou a été supprimé.
 */
public class FichierIntrouvableException extends RuntimeException {
    public FichierIntrouvableException(UUID id) {
        super("Le fichier "+ id +" est introuvable ou a été supprimé");
    }
}
