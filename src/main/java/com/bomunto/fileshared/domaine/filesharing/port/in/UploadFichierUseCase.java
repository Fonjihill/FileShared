package com.bomunto.fileshared.domaine.filesharing.port.in;

/**
 * Interface pour le cas d'utilisation de téléchargement de fichier.
 * Permet à un utilisateur de télécharger un fichier partagé.
 */
public interface UploadFichierUseCase {
    FichierResult upload(UploadFichierCommand command);
}
