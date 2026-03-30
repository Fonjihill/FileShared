package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import com.bomunto.fileshared.domaine.filesharing.Permission;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CreerLienRequest(
        @NotNull(message = "La permission est obligatoire")
        Permission permission,

        Instant expiration
) {
}
