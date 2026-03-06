package com.bomunto.fileshared.domaine.filesharing.port.out;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port de sortie pour la gestion des liens de partage.
 */
public interface LienPartageRepository {

    LienPartage save(LienPartage lienPartage);
    Optional<LienPartage> findByToken(String token);
    List<LienPartage> findByFichierId(UUID fichierId);
    void deleteById(UUID id);
}
