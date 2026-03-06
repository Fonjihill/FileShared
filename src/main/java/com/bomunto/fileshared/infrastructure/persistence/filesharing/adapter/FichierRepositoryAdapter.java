package com.bomunto.fileshared.infrastructure.persistence.filesharing.adapter;

import com.bomunto.fileshared.domaine.filesharing.Fichier;
import com.bomunto.fileshared.domaine.filesharing.port.out.FichierRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.FichierJpaEntity;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa.JpaFichierRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper.FichierMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class FichierRepositoryAdapter implements FichierRepository {

    private final JpaFichierRepository jpa;

    public FichierRepositoryAdapter(JpaFichierRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Fichier save(Fichier fichier) {

        FichierJpaEntity jpaEntity = FichierMapper.toJpa(fichier);
        FichierJpaEntity saved = jpa.save(jpaEntity);
        return FichierMapper.toDomain(saved);
    }

    @Override
    public Optional<Fichier> findById(UUID id) {
        return jpa.findById(id).map(FichierMapper::toDomain);
    }

    @Override
    public List<Fichier> findByProprietaireId(UUID proprietaireId) {
        return jpa.findByProprietaireId(proprietaireId).stream()
                .map(FichierMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpa.deleteById(id);
    }
}
