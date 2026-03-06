package com.bomunto.fileshared.domaine.identity.port.out;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

import java.util.Optional;

/**
 * Port de sortie pour la gestion des utilisateurs.
 */
public interface UtilisateurRepository{

    Utilisateur save(Utilisateur utilisateur);
    Optional<Utilisateur> findByEmail(String email);
    Optional<Utilisateur> findByUsername(String username);
    boolean existsByEmail(String email);
    long count();

}
