package com.bomunto.fileshared.infrastructure.persistence.filesharing.adapter;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;
import com.bomunto.fileshared.domaine.filesharing.port.out.LienPartageRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa.JpaLienPartageRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper.LienPartageMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class LienPartageRepositoryAdapter implements LienPartageRepository {

    private final JpaLienPartageRepository jpa;

    public LienPartageRepositoryAdapter(JpaLienPartageRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public LienPartage save(LienPartage lienPartage) {
        return LienPartageMapper.toDomain(jpa.save(LienPartageMapper.toJpa(lienPartage)));
    }

    @Override
    public Optional<LienPartage> findByToken(String token) {
        return jpa.findByToken(token).map(LienPartageMapper::toDomain);
    }

    @Override
    public List<LienPartage> findByFichierId(UUID fichierId) {
        return jpa.findByFichierId(fichierId).stream()
                .map(LienPartageMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpa.deleteById(id);
    }
}
