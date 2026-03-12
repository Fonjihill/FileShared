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

    /**
     * Constructeur complet pour l'entité Utilisateur.
     *
     * @param id           L'identifiant unique de l'utilisateur.
     * @param username     Le nom d'utilisateur de l'utilisateur.
     * @param email        L'adresse e-mail de l'utilisateur.
     * @param passwordHash Le hachage du mot de passe de l'utilisateur.
     * @param role         Le rôle de l'utilisateur (ADMIN ou USER).
     * @param createdAt    La date de création de l'utilisateur.
     * @param updatedAt    La date de dernière mise à jour de l'utilisateur.
     */
    public Utilisateur(UUID id, String username, String email, String passwordHash,
                       Role role, Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    /** Constructeur par défaut nécessaire pour les frameworks de persistance ou de sérialisation.
     * Il est recommandé de ne pas l'utiliser directement dans le code métier.
     */
    public Utilisateur() {
        super();
    }

    /**
     * Ces méthodes permettent d'accéder aux informations de l'utilisateur de manière sécurisée.
     */
    public UUID getId() {
        return id;
    }

    /**
     * Le nom d'utilisateur est une information sensible qui peut être utilisée pour l'authententification.
     */
    public String getUsername() {
        return username;
    }

    /**
     * L'adresse e-mail est également une information sensible qui peut être utilisée pour l'authententification.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Le hachage du mot de passe est une information très sensible qui ne doit jamais être exposée ou retournée dans les réponses d'API.
     */
    public String getPasswordHash() {
        return passwordHash;
    }

    /**
     * Le rôle de l'utilisateur est une information importante pour la gestion des autorisations
     */
    public Role getRole() {
        return role;
    }

}
