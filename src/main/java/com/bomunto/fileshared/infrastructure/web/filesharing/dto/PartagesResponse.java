package com.bomunto.fileshared.infrastructure.web.filesharing.dto;

import java.util.List;

public record PartagesResponse(
        List<LienPartageDto> liens,
        List<PartageUtilisateurDto> utilisateurs
) {
}
