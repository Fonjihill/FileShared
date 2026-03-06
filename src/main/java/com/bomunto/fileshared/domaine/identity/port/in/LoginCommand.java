package com.bomunto.fileshared.domaine.identity.port.in;

public record LoginCommand(String email, String motDePasse) {
}
