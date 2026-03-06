package com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper;

import com.bomunto.fileshared.domaine.filesharing.PartageUtilisateur;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.PartageUtilisateurJpaEntity;

public final class PartageUtilisateurMapper {

    private PartageUtilisateurMapper() {}

    public static PartageUtilisateur toDomain(PartageUtilisateurJpaEntity jpa) {
        return new PartageUtilisateur(
                jpa.getId(), jpa.getFichierId(), jpa.getDestinataire(),
                jpa.getPermission(), jpa.getCreatedAt(), jpa.getUpdatedAt()
        );
    }

    public static PartageUtilisateurJpaEntity toJpa(PartageUtilisateur domain) {
        PartageUtilisateurJpaEntity jpa = new PartageUtilisateurJpaEntity();
        jpa.setId(domain.getId());
        jpa.setFichierId(domain.getFichierId());
        jpa.setDestinataireId(domain.getDestinataire());
        jpa.setPermission(domain.getPermission());
        return jpa;
    }
}
