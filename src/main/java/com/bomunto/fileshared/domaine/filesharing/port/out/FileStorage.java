package com.bomunto.fileshared.domaine.filesharing.port.out;

import java.io.InputStream;

/**
 * Interface pour le stockage des fichiers. Elle définit les méthodes nécessaires pour stocker, récupérer et supprimer des fichiers.
 */
public interface FileStorage {

    String stocker(String nom, InputStream contenu);
    InputStream recuperer(String chemin);
    void supprimer(String chemin);
}
