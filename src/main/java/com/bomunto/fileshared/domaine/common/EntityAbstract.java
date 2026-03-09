package com.bomunto.fileshared.domaine.common;

import java.time.Instant;

/**
 * Classe abstraite représentant une entité avec des champs de création et de mise à jour.
 */
public abstract class EntityAbstract {

    private Instant createdAt;
    private Instant updatedAt;

    /*
     * Constructeur par défaut pour les entités qui n'ont pas besoin de champs de création et de mise à jour.
     */
    public EntityAbstract() {
    }

    /*
     * Constructeur complet pour les entités qui ont besoin de champs de création et de mise à jour.
     */
    public EntityAbstract(Instant createdAt, Instant updatedAt) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /*
     * Getters pour les champs de création et de mise à jour.
     */
    public Instant getCreatedAt() {
            return createdAt;
        }
    /*
     * Getters pour les champs de création et de mise à jour.
     */
    public Instant getUpdatedAt() {
            return updatedAt;
        }
}
