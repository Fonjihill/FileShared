package com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.LienPartageJpaEntity;

public final class LienPartageMapper {

    private LienPartageMapper() {}

    public static LienPartage toDomain(LienPartageJpaEntity jpa) {
        return new LienPartage(
                jpa.getId(), jpa.getFichierId(), jpa.getToken(),
                jpa.getPermission(), jpa.getExpiration(), jpa.isActif(),
                jpa.getCreateurId(), jpa.getCreatedAt(), jpa.getUpdatedAt()
        );
    }

    public static LienPartageJpaEntity toJpa(LienPartage domain) {
        LienPartageJpaEntity jpa = new LienPartageJpaEntity();
        jpa.setId(domain.getId());
        jpa.setFichierId(domain.getFichierId());
        jpa.setToken(domain.getToken());
        jpa.setPermission(domain.getPermission());
        jpa.setExpiration(domain.getExpiration());
        jpa.setActif(domain.isActif());
        jpa.setCreateurId(domain.getCreateurId());
        return jpa;
    }
}
