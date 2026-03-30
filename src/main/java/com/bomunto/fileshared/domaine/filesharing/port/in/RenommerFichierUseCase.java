package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.filesharing.Fichier;

import java.util.UUID;

/**
 * Use case pour renommer un fichier.
 */
public interface RenommerFichierUseCase {
    Fichier renommer(UUID fichierId, UUID utilisateurId, String nouveauNom);
}
