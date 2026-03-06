package com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa;

import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.LienPartageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaLienPartageRepository extends JpaRepository<LienPartageJpaEntity, UUID> {

    Optional<LienPartageJpaEntity> findByToken(String token);
    List<LienPartageJpaEntity> findByFichierId(UUID fichierId);
}
