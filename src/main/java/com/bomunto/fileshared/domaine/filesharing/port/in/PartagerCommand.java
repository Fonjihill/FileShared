package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.filesharing.Permission;

import java.util.UUID;

/**
 * Commande pour partager un fichier avec un autre utilisateur.
 *
 * @param fichierId       L'identifiant du fichier à partager.
 * @param proprietaireId  L'identifiant du propriétaire du fichier.
 * @param destinataireId  L'identifiant du destinataire avec qui le fichier est partagé.
 * @param permission      Le niveau de permission accordé au destinataire (lecture, écriture, etc.).
 */
public record PartagerCommand(UUID fichierId, UUID proprietaireId,
                              UUID destinataireId, Permission permission) {
}
