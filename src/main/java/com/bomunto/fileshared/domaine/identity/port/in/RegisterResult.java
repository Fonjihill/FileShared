package com.bomunto.fileshared.domaine.identity.port.in;

import com.bomunto.fileshared.domaine.identity.Utilisateur;

/**
 * Résultat de l'enregistrement d'un utilisateur.
 *
 * @param utilisateur L'utilisateur qui a été enregistré.
 */
public record RegisterResult(Utilisateur utilisateur) {
}
