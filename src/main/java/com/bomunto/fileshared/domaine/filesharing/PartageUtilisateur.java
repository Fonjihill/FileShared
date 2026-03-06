package com.bomunto.fileshared.domaine.filesharing;

import com.bomunto.fileshared.domaine.common.EntityAbstract;

import java.time.Instant;
import java.util.UUID;

/**
 * Représente un partage de fichier avec un utilisateur spécifique.
 */
public class PartageUtilisateur extends EntityAbstract {

    private UUID id;
    private UUID fichierId;
    private UUID destinataireId;
    private Permission permission;

    public PartageUtilisateur() {
    }

    public PartageUtilisateur(UUID id, UUID fichierId, UUID destinataireId,
                              Permission permission, Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.fichierId = fichierId;
        this.destinataireId = destinataireId;
        this.permission = permission;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFichierId() {
        return fichierId;
    }

    public UUID getDestinataire() {
        return destinataireId;
    }

    public Permission getPermission() {
        return permission;
    }
}
