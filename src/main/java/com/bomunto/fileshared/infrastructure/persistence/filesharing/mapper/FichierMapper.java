package com.bomunto.fileshared.infrastructure.persistence.filesharing.mapper;

import com.bomunto.fileshared.domaine.filesharing.Fichier;
import com.bomunto.fileshared.infrastructure.persistence.filesharing.entity.FichierJpaEntity;

public final class FichierMapper {

        private FichierMapper() {}

        public static Fichier toDomain(FichierJpaEntity jpa) {
            return new Fichier(
                    jpa.getId(), jpa.getNom(), jpa.getNomOriginal(), jpa.getTaille(),
                    jpa.getTypeMime(), jpa.getCheminStockage(), jpa.getProprietaireId(), jpa.getStatut(), jpa.getCreatedAt(), jpa.getUpdatedAt()
            );
        }

        public static FichierJpaEntity toJpa(Fichier domain) {
            FichierJpaEntity jpa = new FichierJpaEntity();
            jpa.setId(domain.getId());
            jpa.setNom(domain.getNom());
            jpa.setNomOriginal(domain.getNomOriginal());
            jpa.setTaille(domain.getTaille());
            jpa.setTypeMime(domain.getTypeMime());
            jpa.setCheminStockage(domain.getCheminStockage());
            jpa.setProprietaireId(domain.getProprietaireId());
            jpa.setStatut(domain.getStatut());
            return jpa;
        }
}
