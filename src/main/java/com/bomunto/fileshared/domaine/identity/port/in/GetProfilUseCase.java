package com.bomunto.fileshared.domaine.identity.port.in;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

import java.util.UUID;

/**
 * Cas d'utilisation pour récupérer le profil de l'utilisateur connecté.
 */
public interface GetProfilUseCase {
    Utilisateur getProfil(UUID utilisateurId);
}
