package com.bomunto.fileshared.domaine.filesharing.port.in;

import java.util.UUID;

/**
 * Use case pour la suppression d'un fichier.
 */
public interface SupprimerFichierUseCase {

    void supprimer(UUID fichierId, UUID utilisateurId);
}
