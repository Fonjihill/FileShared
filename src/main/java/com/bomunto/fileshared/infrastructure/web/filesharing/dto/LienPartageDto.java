package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;

import java.time.Instant;
import java.util.UUID;

public record LienPartageDto(
        UUID id,
        UUID fichierId,
        String token,
        String permission,
        Instant expiration,
        boolean actif,
        Instant createdAt
) {
    public static LienPartageDto from(LienPartage lien) {
        return new LienPartageDto(
                lien.getId(),
                lien.getFichierId(),
                lien.getToken(),
                lien.getPermission().name(),
                lien.getExpiration(),
                lien.isActif(),
                lien.getCreatedAt()
        );
    }
}
