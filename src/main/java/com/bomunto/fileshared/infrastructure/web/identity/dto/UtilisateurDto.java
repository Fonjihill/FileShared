package com.bomunto.fileshared.infrastructure.web.identity.dto;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

import java.time.Instant;
import java.util.UUID;

public record UtilisateurDto(
        UUID id,
        String email,
        String username,
        String role,
        Instant createdAt
) {

    public static UtilisateurDto from(Utilisateur u) {
        return new UtilisateurDto(
                u.getId(),
                u.getEmail(),
                u.getUsername(),
                u.getRole().name(),
                u.getCreatedAt()
        );
    }
}
