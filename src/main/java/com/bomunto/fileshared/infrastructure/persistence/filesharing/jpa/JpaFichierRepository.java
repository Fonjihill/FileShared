package com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa;

import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.FichierJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaFichierRepository extends JpaRepository<FichierJpaEntity, UUID> {

    List<FichierJpaEntity> findByProprietaireId(UUID proprietaireId);
}
