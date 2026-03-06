package com.bomunto.fileshared.domaine.identity.port.in;

/**
 * Cas d'utilisation pour l'enregistrement d'un utilisateur.
 */
public interface RegisterUseCase {
    RegisterResult register(RegisterCommand command);
}
