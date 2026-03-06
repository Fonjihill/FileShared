package com.bomunto.fileshared.domaine.identity.port.out;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

public interface TokenProvider {
    String generateToken(Utilisateur utilisateur);
    String generateRefreshToken(Utilisateur utilisateur);
    String extractUsername(String token);
    boolean isTokenValid(String token, String username);
}
