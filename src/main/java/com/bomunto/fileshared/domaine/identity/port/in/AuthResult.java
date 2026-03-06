package com.bomunto.fileshared.domaine.identity.port.in;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

public record AuthResult(String token, String refreshToken, Utilisateur utilisateur) {
}
