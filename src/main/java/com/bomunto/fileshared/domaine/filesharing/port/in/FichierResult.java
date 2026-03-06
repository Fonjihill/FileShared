package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.filesharing.Fichier;

/**
 * FichierResult est une classe de données immuable qui encapsule un objet Fichier.
 * Elle est utilisée pour représenter le résultat d'une opération liée à un fichier,
 * comme l'upload ou le téléchargement d'un fichier.
 *
 * @param fichier l'objet Fichier associé au résultat de l'opération
 */
public record FichierResult(Fichier fichier) {
}
