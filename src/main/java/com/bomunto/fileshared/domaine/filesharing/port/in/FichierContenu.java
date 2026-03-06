package com.bomunto.fileshared.domaine.filesharing.port.in;

import java.io.InputStream;

/**
 * Représente le contenu d'un fichier, incluant son nom, son type MIME et son flux de données.
 *
 * @param nom      Le nom du fichier.
 * @param typeMime Le type MIME du fichier (ex: "image/png", "application/pdf").
 * @param contenu  Le flux de données du fichier.
 */
public record FichierContenu(String nom, String typeMime, InputStream contenu) {
}
