package com.bomunto.fileshared.infrastructure.persistence.filesharing.adapter;

import com.bomunto.fileshared.domaine.filesharing.ActiviteLog;
import com.bomunto.fileshared.domaine.filesharing.port.out.ActiviteLogRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.ActiviteLogJpaEntity;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.jpa.JpaActiviteLogRepository;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper.ActiviteLogMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class ActiviteLogRepositoryAdapter implements ActiviteLogRepository {

    private final JpaActiviteLogRepository jpa;

    public ActiviteLogRepositoryAdapter(JpaActiviteLogRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public ActiviteLog save(ActiviteLog activiteLog) {
        ActiviteLogJpaEntity jpaEntity = ActiviteLogMapper.toJpa(activiteLog);
        ActiviteLogJpaEntity saved = jpa.save(jpaEntity);
        return ActiviteLogMapper.toDomain(saved);
    }

    @Override
    public List<ActiviteLog> findByUtilisateurIdOrderByCreatedAtDesc(UUID utilisateurId, int limit) {
        return jpa.findByUtilisateurIdOrderByCreatedAtDesc(utilisateurId, PageRequest.of(0, limit))
                .stream()
                .map(ActiviteLogMapper::toDomain)
                .toList();
    }
}
