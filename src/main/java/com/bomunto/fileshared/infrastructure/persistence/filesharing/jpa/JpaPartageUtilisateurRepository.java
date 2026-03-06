package com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa;

import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.PartageUtilisateurJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaPartageUtilisateurRepository extends JpaRepository<PartageUtilisateurJpaEntity, UUID> {

    List<PartageUtilisateurJpaEntity> findByDestinataire(UUID destinataireId);
    List<PartageUtilisateurJpaEntity> findByFichierId(UUID fichierId);
}
