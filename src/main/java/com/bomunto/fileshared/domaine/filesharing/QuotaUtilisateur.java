package com.bomunto.fileshared.domaine.filesharing;

import java.util.UUID;

/**
 * Represente le quota de stockage d'un utilisateur.
 */
public class QuotaUtilisateur {

    private static final long ESPACE_MAXIMUM_PAR_DEFAUT = 104857600L; // 100 MB

    private UUID utilisateurId;
    private long espaceUtilise;
    private long espaceMaximum;

    public QuotaUtilisateur(UUID utilisateurId, long espaceUtilise) {
        this(utilisateurId, espaceUtilise, ESPACE_MAXIMUM_PAR_DEFAUT);
    }

    public QuotaUtilisateur(UUID utilisateurId, long espaceUtilise, long espaceMaximum) {
        this.utilisateurId = utilisateurId;
        this.espaceUtilise = espaceUtilise;
        this.espaceMaximum = espaceMaximum;
    }

    public boolean peutUploader(long tailleFichier) {
        return (espaceUtilise + tailleFichier) <= espaceMaximum;
    }

    public void ajouterEspace(long taille) {
        this.espaceUtilise += taille;
    }

    public UUID getUtilisateurId() {
        return utilisateurId;
    }

    public long getEspaceUtilise() {
        return espaceUtilise;
    }

    public long getEspaceMaximum() {
        return espaceMaximum;
    }
}
