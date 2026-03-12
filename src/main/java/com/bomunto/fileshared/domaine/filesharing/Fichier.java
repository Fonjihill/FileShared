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

    /**
     * Constructeur complet pour l'entité Fichier.
     *
     * @param id              L'identifiant unique du fichier.
     * @param nom             Le nom du fichier tel qu'il est affiché dans le système.
     * @param nomOriginal     Le nom original du fichier tel qu'il a été téléchargé.
     * @param taille          La taille du fichier en octets.
     * @param typeMime        Le type MIME du fichier (ex: "image/png", "application/pdf").
     * @param cheminStockage  Le chemin de stockage du fichier sur le serveur ou dans le cloud.
     * @param proprietaireId  L'identifiant de l'utilisateur propriétaire du fichier.
     * @param statut          Le statut actuel du fichier (ex: ACTIF, SUPPRIME).
     * @param createdAt       La date de création du fichier.
     * @param updatedAt       La date de dernière mise à jour du fichier.
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

    /*
        * Méthodes de logique métier pour vérifier le statut du fichier
     */
    public boolean estActif() {
        return this.statut == StatutFichier.ACTIF;
    }

    /* La suppression d'un fichier ne le supprime pas physiquement, mais change son statut pour indiquer qu'il n'est plus accessible.
     * Cela permet de conserver les données pour des raisons de traçabilité ou de restauration éventuelle.
     */
    public boolean estSupprime() {
        return this.statut == StatutFichier.SUPPRIME;
    }

    /* Cette méthode permet de marquer un fichier comme supprimé en changeant son statut.
     * Elle ne supprime pas physiquement le fichier du stockage, mais indique qu'il n'est plus actif.
     */
    public void marquerCommeSupprime() {
        this.statut = StatutFichier.SUPPRIME;
    }
}
