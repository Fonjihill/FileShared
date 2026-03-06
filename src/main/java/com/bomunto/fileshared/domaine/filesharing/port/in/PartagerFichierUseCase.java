package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;

import java.util.UUID;

/**
 * Use case pour le partage de fichiers.
 */
public interface PartagerFichierUseCase {

    LienPartage partagerParLien(CreerLienCommand command);
    void partagerAvecUtilisateur(PartagerCommand command);
    void revoquerPartage(UUID partageId, UUID utilisateurId);
}
