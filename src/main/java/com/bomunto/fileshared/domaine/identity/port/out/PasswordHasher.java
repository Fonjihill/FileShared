package com.bomunto.fileshared.domaine.identity.port.out;

/**
 * Port de sortie pour le hachage des mots de passe.
 */
public interface PasswordHasher {
    String hash(String rawPassword);
    boolean matches(String rawPassword, String hashedPassword);
}
