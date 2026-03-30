package com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper;

import com.bomunto.fileshared.domaine.filesharing.ActiviteLog;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.ActiviteLogJpaEntity;

public final class ActiviteLogMapper {

    private ActiviteLogMapper() {}

    public static ActiviteLog toDomain(ActiviteLogJpaEntity jpa) {
        return new ActiviteLog(
                jpa.getId(), jpa.getUtilisateurId(), jpa.getAction(),
                jpa.getFichierId(), jpa.getDetails(),
                jpa.getCreatedAt(), jpa.getUpdatedAt()
        );
    }

    public static ActiviteLogJpaEntity toJpa(ActiviteLog domain) {
        ActiviteLogJpaEntity jpa = new ActiviteLogJpaEntity();
        jpa.setId(domain.getId());
        jpa.setUtilisateurId(domain.getUtilisateurId());
        jpa.setAction(domain.getAction());
        jpa.setFichierId(domain.getFichierId());
        jpa.setDetails(domain.getDetails());
        return jpa;
    }
}
