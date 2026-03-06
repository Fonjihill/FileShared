package com.bomunto.fileshared.domaine.filesharing.port.in;

import java.util.UUID;

/**
 * Commande pour le téléchargement d'un fichier.
 *
 * @param fichierId    L'identifiant du fichier à télécharger.
 * @param utilisateurId L'identifiant de l'utilisateur qui effectue le téléchargement.
 */
public record TelechargerCommand(UUID fichierId, UUID utilisateurId) {
}
