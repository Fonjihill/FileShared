package com.bomunto.fileshared.domaine.identity.port.in;

public record RegisterCommand(String email, String username, String motDePasse) {
}
