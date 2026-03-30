package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import com.bomunto.fileshared.domaine.filesharing.ActiviteLog;

import java.time.Instant;
import java.util.UUID;

public record ActiviteLogDto(
        UUID id,
        String action,
        String details,
        Instant createdAt
) {
    public static ActiviteLogDto from(ActiviteLog log) {
        return new ActiviteLogDto(
                log.getId(),
                log.getAction(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
