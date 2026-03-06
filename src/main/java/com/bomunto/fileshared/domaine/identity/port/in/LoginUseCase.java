package com.bomunto.fileshared.domaine.identity.port.in;

/**
 * Interface représentant le cas d'utilisation de connexion d'un utilisateur.
 */
public interface LoginUseCase {
    AuthResult login(LoginCommand command);
}
