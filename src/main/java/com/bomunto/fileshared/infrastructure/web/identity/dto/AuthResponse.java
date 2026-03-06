package com.bomunto.fileshared.infrastructure.web.identity.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        UtilisateurDto utilisateur
) {
}
