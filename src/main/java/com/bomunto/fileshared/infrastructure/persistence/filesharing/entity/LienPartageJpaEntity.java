package com.bomunto.fileshared.infrastructure.persistence.filesharing.entity;

import com.bomunto.fileshared.domaine.filesharing.Permission;
import com.bomunto.fileshared.infrastructure.persistence.common.entity.JpaEntityAbstract;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "liens_partage")
public class LienPartageJpaEntity extends JpaEntityAbstract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fichier_id", nullable = false)
    private UUID fichierId;

    @Column(unique = true, nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Permission permission;

    @Column
    private Instant expiration;

    @Column(nullable = false)
    private boolean actif;

    @Column(name = "createur_id", nullable = false)
    private UUID createurId;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    public LienPartageJpaEntity() {
    }

    public LienPartageJpaEntity(UUID id, UUID fichierId, String token, Permission permission,
                                Instant expiration, boolean actif, UUID createurId) {
        this.id = id;
        this.fichierId = fichierId;
        this.token = token;
        this.permission = permission;
        this.expiration = expiration;
        this.actif = actif;
        this.createurId = createurId;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getFichierId() { return fichierId; }
    public void setFichierId(UUID fichierId) { this.fichierId = fichierId; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Permission getPermission() { return permission; }
    public void setPermission(Permission permission) { this.permission = permission; }
    public Instant getExpiration() { return expiration; }
    public void setExpiration(Instant expiration) { this.expiration = expiration; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
    public UUID getCreateurId() { return createurId; }
    public void setCreateurId(UUID createurId) { this.createurId = createurId; }
    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}
