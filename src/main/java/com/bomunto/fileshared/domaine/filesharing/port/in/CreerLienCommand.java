package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.filesharing.Permission;

import java.time.Instant;
import java.util.UUID;

/**
 * Commande pour créer un lien de partage d'un fichier avec un utilisateur.
 *
 * @param fichierId     L'identifiant du fichier à partager.
 * @param proprietaireId L'identifiant de l'utilisateur propriétaire du fichier.
 * @param permission    Le niveau de permission accordé (lecture, écriture, etc.).
 * @param expiration    La date d'expiration du lien de partage.
 */
public record CreerLienCommand(UUID fichierId, UUID proprietaireId,
                               Permission permission, Instant expiration,
                               String motDePasse) {
}
