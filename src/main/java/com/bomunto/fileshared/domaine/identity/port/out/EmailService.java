package com.bomunto.fileshared.domaine.identity.port.out;

/**
 * Port de sortie pour l'envoi d'emails.
 */
public interface EmailService {
    void envoyerNotificationPartage(String emailDestinataire, String nomFichier, String nomProprietaire);
}
