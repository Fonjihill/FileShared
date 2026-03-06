package com.bomunto.fileshared.domaine.filesharing;

import com.bomunto.fileshared.domaine.common.EntityAbstract;

import java.time.Instant;
import java.util.UUID;

/**
 * Représente un fichier partagé dans le système.
 */
public class Fichier extends EntityAbstract {

    private UUID id;
    private String nom;
    private String nomOriginal;
    private long taille;
    private String typeMime;
    private String cheminStockage;
    private UUID proprietaireId;
    private StatutFichier statut;

    /*
        * Constructeur par défaut
     */
    public Fichier(){
    }

    /*
        * Constructeur complet pour créer une instance de Fichier
     */
    public Fichier(UUID id, String nom, String nomOriginal, long taille,
                   String typeMime, String cheminStockage, UUID proprietaireId,
                   StatutFichier statut, Instant createdAt, Instant updatedAt) {
        super(createdAt, updatedAt);
        this.id = id;
        this.nom = nom;
        this.nomOriginal = nomOriginal;
        this.taille = taille;
        this.typeMime = typeMime;
        this.cheminStockage = cheminStockage;
        this.proprietaireId = proprietaireId;
        this.statut = statut;
    }


    public UUID getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getNomOriginal() {
        return nomOriginal;
    }

    public long getTaille() {
        return taille;
    }

    public String getTypeMime() {
        return typeMime;
    }

    public String getCheminStockage() {
        return cheminStockage;
    }

    public UUID getProprietaireId() {
        return proprietaireId;
    }

    public StatutFichier getStatut() {
        return statut;
    }

    public boolean estActif() {
        return this.statut == StatutFichier.ACTIF;
    }

    public boolean estSupprime() {
        return this.statut == StatutFichier.SUPPRIME;
    }

    public void marquerCommeSupprime() {
        this.statut = StatutFichier.SUPPRIME;
    }


}
