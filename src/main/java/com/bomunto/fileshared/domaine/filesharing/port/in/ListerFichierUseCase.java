package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.common.PageResult;
import com.bomunto.fileshared.domaine.filesharing.Fichier;

import java.util.List;
import java.util.UUID;

/**
 * Use case pour la liste des fichiers d'un utilisateur.
 * Permet de récupérer les fichiers d'un utilisateur ainsi que les fichiers partagés avec lui.
 */
public interface ListerFichierUseCase {

    List<Fichier> listerFichiers(UUID proprietaireId);
    List<Fichier> listerFichiersPartagesAvecMoi(UUID utilisateurId);
    PageResult<Fichier> listerFichiersPagines(UUID proprietaireId, int page, int size);
}
