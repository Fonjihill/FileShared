package com.bomunto.fileshared.domaine.filesharing.port.out;

import com.bomunto.fileshared.domaine.filesharing.Fichier;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port de sortie pour la gestion des fichiers.
 * Permet d'abstraire les opérations de persistance des fichiers.
 */
public interface FichierRepository {

    Fichier save(Fichier fichier);
    Optional<Fichier> findById(UUID id);
    List<Fichier> findByProprietaireId(UUID proprietaireId);
    void deleteById(UUID id);
}
