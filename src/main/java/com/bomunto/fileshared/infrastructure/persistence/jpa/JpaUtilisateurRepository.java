package com.bomunto.fileshared.infrastructure.persistence.jpa;

import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.infrastructure.persistence.entity.UtilisateurJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaUtilisateurRepository extends JpaRepository<UtilisateurJpaEntity, UUID> {

    Optional<UtilisateurJpaEntity> findByEmail(String email);
    Optional<UtilisateurJpaEntity> findByUsername(String username);
    boolean existsByEmail(String email);

}
