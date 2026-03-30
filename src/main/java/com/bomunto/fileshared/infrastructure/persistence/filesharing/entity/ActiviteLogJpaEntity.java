package com.bomunto.fileshared.infrastructure.persistence.filesharing.entity;

import com.bomunto.fileshared.infrastructure.persistence.common.entity.JpaEntityAbstract;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "activite_logs")
public class ActiviteLogJpaEntity extends JpaEntityAbstract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "utilisateur_id", nullable = false)
    private UUID utilisateurId;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "fichier_id")
    private UUID fichierId;

    @Column(name = "details")
    private String details;

    public ActiviteLogJpaEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(UUID utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public UUID getFichierId() {
        return fichierId;
    }

    public void setFichierId(UUID fichierId) {
        this.fichierId = fichierId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
