package com.bomunto.fileshared.infrastructure.persistence.filesharing.entity;

import com.bomunto.fileshared.domaine.filesharing.Permission;
import com.bomunto.fileshared.infrastructure.persistence.common.entity.JpaEntityAbstract;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "partages_utilisateur")
public class PartageUtilisateurJpaEntity extends JpaEntityAbstract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fichier_id", nullable = false)
    private UUID fichierId;

    @Column(name = "destinataire_id", nullable = false)
    private UUID destinataire;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false, length = 20)
    private Permission permission;

    public PartageUtilisateurJpaEntity() {
    }

    public PartageUtilisateurJpaEntity(UUID id, UUID fichierId, UUID destinataire, Permission permission) {
        this.id = id;
        this.fichierId = fichierId;
        this.destinataire = destinataire;
        this.permission = permission;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFichierId() {
        return fichierId;
    }

    public void setFichierId(UUID fichierId) {
        this.fichierId = fichierId;
    }

    public UUID getDestinataire() {
        return destinataire;
    }

    public void setDestinataireId(UUID destinataire) {
        this.destinataire = destinataire;
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
    }
}
