package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import com.bomunto.fileshared.domaine.filesharing.Permission;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PartagerRequest(
        @NotNull(message = "Le destinataire est obligatoire")
        UUID destinataireId,

        @NotNull(message = "La permission est obligatoire")
        Permission permission
) {
}
