package com.bomunto.fileshared.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
   @Email(message = "Format email invalide")
    String email,
    @NotBlank(message = "Le mot de passe est obligatoire")
    String motDePasse
) {
}
