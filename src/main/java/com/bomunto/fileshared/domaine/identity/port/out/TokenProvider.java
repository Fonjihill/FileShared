package com.bomunto.fileshared.domaine.identity.port.out;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

/**
 * Interface pour la génération et la validation des tokens d'authentification.
 */
public interface TokenProvider {
    String generateToken(Utilisateur utilisateur);
    String generateRefreshToken(Utilisateur utilisateur);
    String extractUsername(String token);
    boolean isTokenValid(String token, String username);
}
