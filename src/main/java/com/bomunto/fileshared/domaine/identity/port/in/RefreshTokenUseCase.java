package com.bomunto.fileshared.domaine.identity.port.in;

/**
 * Cas d'utilisation pour le rafraîchissement du token d'accès.
 */
public interface RefreshTokenUseCase {
    AuthResult refresh(String refreshToken);
}
