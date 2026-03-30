package com.bomunto.fileshared.domaine.filesharing;

import com.bomunto.fileshared.domaine.common.EntityAbstract;

import java.time.Instant;
import java.util.UUID;

/**
 * Represente une entree dans le journal d'activite d'un utilisateur.
 */
public class ActiviteLog extends EntityAbstract {

    private UUID id;
    private UUID utilisateurId;
    private String action;
    private UUID fichierId;
    private String details;

    public ActiviteLog() {
    }

    public ActiviteLog(UUID id, UUID utilisateurId, String action, UUID fichierId,
                       String details, Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.utilisateurId = utilisateurId;
        this.action = action;
        this.fichierId = fichierId;
        this.details = details;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUtilisateurId() {
        return utilisateurId;
    }

    public String getAction() {
        return action;
    }

    public UUID getFichierId() {
        return fichierId;
    }

    public String getDetails() {
        return details;
    }
}
