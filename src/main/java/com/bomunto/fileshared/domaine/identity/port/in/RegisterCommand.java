package com.bomunto.fileshared.domaine.identity.port.in;

/**
 * Commande pour l'enregistrement d'un nouvel utilisateur.
 *
 * @param email        L'adresse e-mail de l'utilisateur.
 * @param username     Le nom d'utilisateur choisi.
 * @param motDePasse   Le mot de passe de l'utilisateur.
 */
public record RegisterCommand(String email, String username, String motDePasse) {
}
