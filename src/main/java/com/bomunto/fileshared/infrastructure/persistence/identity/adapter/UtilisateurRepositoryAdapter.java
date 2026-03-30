package com.bomunto.fileshared.infrastructure.persistence.identity.adapter;

import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.domaine.identity.port.out.UtilisateurRepository;
import com.bomunto.fileshared.infrastructure.persistence.identity.entity.UtilisateurJpaEntity;
import com.bomunto.fileshared.infrastructure.persistence.identity.jpa.JpaUtilisateurRepository;
import com.bomunto.fileshared.infrastructure.persistence.identity.mapper.UtilisateurMapper;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class UtilisateurRepositoryAdapter implements UtilisateurRepository {

    private final JpaUtilisateurRepository jpa;

    public UtilisateurRepositoryAdapter(JpaUtilisateurRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Utilisateur save(Utilisateur utilisateur) {
        UtilisateurJpaEntity jpaEntity = UtilisateurMapper.toJpa(utilisateur);
        UtilisateurJpaEntity saved = jpa.save(jpaEntity);
        return UtilisateurMapper.toDomain(saved);
    }

    @Override
    public Optional<Utilisateur> findById(UUID id) {
        return jpa.findById(id).map(UtilisateurMapper::toDomain);
    }

    @Override
    public Optional<Utilisateur> findByEmail(String email) {
        return jpa.findByEmail(email).map(UtilisateurMapper::toDomain);
    }

    @Override
    public Optional<Utilisateur> findByUsername(String username) {
        return jpa.findByUsername(username).map(UtilisateurMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpa.existsByEmail(email);
    }

    @Override
    public long count() {
        return jpa.count();
    }
}
