package com.bomunto.fileshared.domaine.identity.port.in;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

/**
 * Représente le résultat d'une opération d'authentification, contenant le token d'accès,
 * le token de rafraîchissement et les informations de l'utilisateur authentifié.
 *
 * @param token        Le token d'accès JWT pour l'utilisateur.
 * @param refreshToken Le token de rafraîchissement pour obtenir un nouveau token d'accès.
 * @param utilisateur  Les informations de l'utilisateur authentifié.
 */
public record AuthResult(String token, String refreshToken, Utilisateur utilisateur) {
}
