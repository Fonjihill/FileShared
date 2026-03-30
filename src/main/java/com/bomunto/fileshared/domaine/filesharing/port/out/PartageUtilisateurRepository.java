package com.bomunto.fileshared.domaine.filesharing.port.out;

import com.bomunto.fileshared.domaine.filesharing.PartageUtilisateur;

import java.util.List;
import java.util.UUID;

/**
 * Port de sortie pour la gestion des partages avec des utilisateurs spécifiques.
 */
public interface PartageUtilisateurRepository {

    PartageUtilisateur save(PartageUtilisateur partage);
    java.util.Optional<PartageUtilisateur> findById(UUID id);
    List<PartageUtilisateur> findByDestinataire(UUID utilisateurId);
    List<PartageUtilisateur> findByFichierId(UUID fichierId);
    void delete(UUID id);
}
