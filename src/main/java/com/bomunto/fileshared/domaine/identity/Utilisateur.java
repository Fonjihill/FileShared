package com.bomunto.fileshared.domaine.identity;

import com.bomunto.fileshared.domaine.common.EntityAbstract;

import java.time.Instant;
import java.util.UUID;

public class Utilisateur extends EntityAbstract {
    private UUID id;
    private String username;
    private String email;
    private String passwordHash;
    private Role role;

    public Utilisateur(UUID id, String username, String email, String passwordHash,
                       Role role, Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public Utilisateur() {
        super();
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Role getRole() {
        return role;
    }


}
