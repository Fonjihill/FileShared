package com.bomunto.fileshared.domaine.filesharing.port.in;

import java.io.InputStream;
import java.util.UUID;

/**
 * Commande pour l'upload d'un fichier.
 *
 * @param nom           Le nom du fichier.
 * @param typeMime      Le type MIME du fichier.
 * @param taille        La taille du fichier en octets.
 * @param contenu       Le flux d'entrée du contenu du fichier.
 * @param proprietaireId L'identifiant du propriétaire du fichier.
 */
public record UploadFichierCommand(String nom, String typeMime, long taille,
                                   InputStream contenu, UUID proprietaireId) {
}
