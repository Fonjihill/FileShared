package com.bomunto.fileshared.infrastructure.web.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        UtilisateurDto utilisateur
) {
}
