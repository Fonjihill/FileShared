package com.bomunto.fileshared.domaine.filesharing;

import com.bomunto.fileshared.domaine.common.EntityAbstract;

import java.time.Instant;
import java.util.UUID;

/*
    * Classe représentant un lien de partage pour un fichier
 */
public class LienPartage extends EntityAbstract {

    private UUID id;
    private UUID fichierId;
    private String token;
    private Permission permission;
    private Instant expiration;
    private boolean actif;
    private UUID createurId;
    private String motDePasse;

    /*
        * Constructeur par défaut de LienPartage
     */
    public LienPartage() {
    }

    /*
        * Constructeur de LienPartage
     */
    public LienPartage(UUID id, UUID fichierId, String token, Permission permission,
                       Instant expiration, boolean actif, UUID createurId,
                       Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.fichierId = fichierId;
        this.token = token;
        this.permission = permission;
        this.expiration = expiration;
        this.actif = actif;
        this.createurId = createurId;
    }

    /*
        * Constructeur de LienPartage avec mot de passe
     */
    public LienPartage(UUID id, UUID fichierId, String token, Permission permission,
                       Instant expiration, boolean actif, UUID createurId,
                       String motDePasse, Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.fichierId = fichierId;
        this.token = token;
        this.permission = permission;
        this.expiration = expiration;
        this.actif = actif;
        this.createurId = createurId;
        this.motDePasse = motDePasse;
    }

    public UUID getId() {
        return id;
    }

    public UUID getFichierId() {
        return fichierId;
    }

    public String getToken() {
        return token;
    }

    public Permission getPermission() {
        return permission;
    }

    public Instant getExpiration() {
        return expiration;
    }

    public boolean isActif() {
        return actif;
    }

    public UUID getCreateurId() {
        return createurId;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public boolean estProtegePArMotDePasse() {
        return motDePasse != null && !motDePasse.isBlank();
    }

    /*
        * Méthode pour vérifier si le lien de partage est expiré
     */
    public boolean estExpire() {
        return expiration != null && Instant.now().isAfter(expiration);
    }

    /*
        * Méthode pour vérifier si le lien de partage est valide (actif et non expiré)
     */
    public boolean estValide() {
        return actif && !estExpire();
    }

    /*
        * Méthode pour désactiver le lien de partage
     */
    public void desactiver() {
        this.actif = false;
    }
}
