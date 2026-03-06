package com.bomunto.fileshared.domaine.filesharing.port.in;

/*
 * Interface de cas d'utilisation pour le téléchargement de fichiers
 * Permet de définir les méthodes nécessaires pour télécharger un fichier
 * en fonction d'une commande ou d'un token de partage
 */
public interface TelechargerFichierUseCase {

    FichierContenu telecharger(TelechargerCommand command);
    FichierContenu telechargerParToken(String token);
}
