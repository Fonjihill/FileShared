package com.bomunto.fileshared.infrastructure.persistence.identity.mapper;

import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.infrastructure.persistence.identity.entity.UtilisateurJpaEntity;

public final class UtilisateurMapper {

    private UtilisateurMapper() {}

    public static Utilisateur toDomain(UtilisateurJpaEntity jpa) {
        return new Utilisateur(
                jpa.getId(), jpa.getUsername(), jpa.getEmail(),
                jpa.getPasswordHash(), jpa.getRole(),
                jpa.getCreatedAt(), jpa.getUpdatedAt()
        );
    }

    public static UtilisateurJpaEntity toJpa(Utilisateur domain) {
        UtilisateurJpaEntity jpa = new UtilisateurJpaEntity();
        jpa.setId(domain.getId());
        jpa.setUsername(domain.getUsername());
        jpa.setEmail(domain.getEmail());
        jpa.setPasswordHash(domain.getPasswordHash());
        jpa.setRole(domain.getRole());
        return jpa;
    }
}
