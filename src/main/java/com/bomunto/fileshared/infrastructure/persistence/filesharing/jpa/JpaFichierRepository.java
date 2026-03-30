package com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa;

import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.FichierJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaFichierRepository extends JpaRepository<FichierJpaEntity, UUID> {

    List<FichierJpaEntity> findByProprietaireId(UUID proprietaireId);

    Page<FichierJpaEntity> findByProprietaireId(UUID proprietaireId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.taille), 0) FROM FichierJpaEntity f WHERE f.proprietaireId = :id AND f.statut = 'ACTIF'")
    long calculerEspaceUtilise(@Param("id") UUID proprietaireId);
}
