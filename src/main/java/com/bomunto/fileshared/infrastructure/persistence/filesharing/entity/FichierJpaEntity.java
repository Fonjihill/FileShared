package com.bomunto.fileshared.infrastructure.persistence.filesharing.entity;


import com.bomunto.fileshared.domaine.filesharing.StatutFichier;
import com.bomunto.fileshared.infrastructure.persistence.common.entity.JpaEntityAbstract;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "fichiers")
public class FichierJpaEntity extends JpaEntityAbstract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "nom_original", nullable = false)
    private String nomOriginal;

    @Column(name = "taille", nullable = false)
    private long taille;

    @Column(name = "type_mime", nullable = false)
    private String typeMime;

    @Column(name = "chemin_stockage", nullable = false)
    private String cheminStockage;

    @Column(name = "proprietaire_id", nullable = false)
    private UUID proprietaireId;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutFichier statut;

    public FichierJpaEntity() {
    }

    public FichierJpaEntity(UUID id, String nom, String nomOriginal, long taille, String typeMime,
                            String cheminStockage, UUID proprietaireId, StatutFichier statut) {
        this.id = id;
        this.nom = nom;
        this.nomOriginal = nomOriginal;
        this.taille = taille;
        this.typeMime = typeMime;
        this.cheminStockage = cheminStockage;
        this.proprietaireId = proprietaireId;
        this.statut = statut;
    }

    public UUID getProprietaireId() {
        return proprietaireId;
    }

    public void setProprietaireId(UUID proprietaireId) {
        this.proprietaireId = proprietaireId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getNomOriginal() {
        return nomOriginal;
    }

    public void setNomOriginal(String nomOriginal) {
        this.nomOriginal = nomOriginal;
    }

    public long getTaille() {
        return taille;
    }

    public void setTaille(long taille) {
        this.taille = taille;
    }

    public String getTypeMime() {
        return typeMime;
    }

    public void setTypeMime(String typeMime) {
        this.typeMime = typeMime;
    }

    public String getCheminStockage() {
        return cheminStockage;
    }

    public void setCheminStockage(String cheminStockage) {
        this.cheminStockage = cheminStockage;
    }

    public StatutFichier getStatut() {
        return statut;
    }

    public void setStatut(StatutFichier statut) {
        this.statut = statut;
    }
}
