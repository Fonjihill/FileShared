package com.bomunto.fileshared.domaine.identity.port.in;

/**
 * Commande pour la connexion d'un utilisateur.
 *
 * @param email        L'adresse e-mail de l'utilisateur.
 * @param motDePasse   Le mot de passe de l'utilisateur.
 */
public record LoginCommand(String email, String motDePasse) {
}
