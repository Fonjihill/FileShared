package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import com.bomunto.fileshared.domaine.filesharing.PartageUtilisateur;

import java.time.Instant;
import java.util.UUID;

public record PartageUtilisateurDto(
        UUID id,
        UUID fichierId,
        UUID destinataireId,
        String permission,
        Instant createdAt
) {
    public static PartageUtilisateurDto from(PartageUtilisateur p) {
        return new PartageUtilisateurDto(
                p.getId(),
                p.getFichierId(),
                p.getDestinataire(),
                p.getPermission().name(),
                p.getCreatedAt()
        );
    }
}
