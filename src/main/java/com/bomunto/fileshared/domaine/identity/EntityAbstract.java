package com.bomunto.fileshared.domaine.identity;

import java.time.Instant;

abstract class EntityAbstract {

    private Instant createdAt;
    private Instant updatedAt;

    public EntityAbstract(Instant createdAt, Instant updatedAt) {
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public EntityAbstract() {

    }

    public Instant getCreatedAt() {
            return createdAt;
        }

    public Instant getUpdatedAt() {
            return updatedAt;
        }
}
