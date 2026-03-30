package com.bomunto.fileshared.domaine.identity.port.in;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

import java.util.Optional;

/**
 * Cas d'utilisation pour rechercher un utilisateur par email.
 */
public interface RechercherUtilisateurUseCase {
    Optional<Utilisateur> rechercherParEmail(String email);
}
