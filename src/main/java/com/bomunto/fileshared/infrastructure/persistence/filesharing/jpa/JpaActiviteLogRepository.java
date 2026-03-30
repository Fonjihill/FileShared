package com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa;

import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.ActiviteLogJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaActiviteLogRepository extends JpaRepository<ActiviteLogJpaEntity, UUID> {

    List<ActiviteLogJpaEntity> findByUtilisateurIdOrderByCreatedAtDesc(UUID utilisateurId, Pageable pageable);
}
