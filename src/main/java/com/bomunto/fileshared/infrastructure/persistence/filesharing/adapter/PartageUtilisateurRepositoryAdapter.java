package com.bomunto.fileshared.infrastructure.persistence.filesharing.adapter;

import com.bomunto.fileshared.domaine.filesharing.PartageUtilisateur;
import com.bomunto.fileshared.domaine.filesharing.port.out.PartageUtilisateurRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa.JpaPartageUtilisateurRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper.PartageUtilisateurMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class PartageUtilisateurRepositoryAdapter implements PartageUtilisateurRepository {

    private final JpaPartageUtilisateurRepository jpa;

    public PartageUtilisateurRepositoryAdapter(JpaPartageUtilisateurRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public PartageUtilisateur save(PartageUtilisateur partage) {
        return PartageUtilisateurMapper.toDomain(jpa.save(PartageUtilisateurMapper.toJpa(partage)));
    }

    @Override
    public Optional<PartageUtilisateur> findById(UUID id) {
        return jpa.findById(id).map(PartageUtilisateurMapper::toDomain);
    }

    @Override
    public List<PartageUtilisateur> findByDestinataire(UUID utilisateurId) {
        return jpa.findByDestinataire(utilisateurId).stream()
                .map(PartageUtilisateurMapper::toDomain)
                .toList();
    }

    @Override
    public List<PartageUtilisateur> findByFichierId(UUID fichierId) {
        return jpa.findByFichierId(fichierId).stream()
                .map(PartageUtilisateurMapper::toDomain)
                .toList();
    }

    @Override
    public void delete(UUID id) {
        jpa.deleteById(id);
    }
}
