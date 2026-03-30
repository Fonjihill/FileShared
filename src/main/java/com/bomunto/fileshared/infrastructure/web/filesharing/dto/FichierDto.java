package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import com.bomunto.fileshared.domaine.filesharing.Fichier;

import java.time.Instant;
import java.util.UUID;

public record FichierDto(
        UUID id,
        String nom,
        String nomOriginal,
        long taille,
        String typeMime,
        String statut,
        Instant createdAt
) {

    public static FichierDto from(Fichier entity) {
        return new FichierDto(
                entity.getId(),
                entity.getNom(),
                entity.getNomOriginal(),
                entity.getTaille(),
                entity.getTypeMime(),
                entity.getStatut().name(),
                entity.getCreatedAt()
        );
    }
}
