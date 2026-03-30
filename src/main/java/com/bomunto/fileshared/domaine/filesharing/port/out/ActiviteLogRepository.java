package com.bomunto.fileshared.domaine.filesharing.port.out;

import com.bomunto.fileshared.domaine.filesharing.ActiviteLog;

import java.util.List;
import java.util.UUID;

/**
 * Port de sortie pour la gestion du journal d'activite.
 */
public interface ActiviteLogRepository {

    ActiviteLog save(ActiviteLog activiteLog);
    List<ActiviteLog> findByUtilisateurIdOrderByCreatedAtDesc(UUID utilisateurId, int limit);
}
