package com.bomunto.fileshared.infrastructure.web.common.dto;

import java.time.Instant;

public record ErrorResponse(
        String message,
        Instant timestamp
) {

    public ErrorResponse(String message) {
        this(message, Instant.now());
    }
}
