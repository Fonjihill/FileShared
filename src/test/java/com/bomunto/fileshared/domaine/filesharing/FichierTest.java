package com.bomunto.fileshared.domaine.filesharing;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class FichierTest {

    // Methode utilitaire pour creer un fichier de test avec un statut donne
    private Fichier creerFichier(StatutFichier statut) {
        return new Fichier(
                UUID.randomUUID(),
                "rapport.pdf",
                "rapport_original.pdf",
                2500L,
                "application/pdf",
                "/uploads/rapport.pdf",
                UUID.randomUUID(),
                statut,
                Instant.now(),
                Instant.now()
        );
    }

    // ===== TEST 1 : Un fichier ACTIF est bien actif =====
    @Test
    @DisplayName("Un fichier avec statut ACTIF doit retourner estActif=true")
    void fichierActif_estActif_retourneTrue() {
        Fichier fichier = creerFichier(StatutFichier.ACTIF);
        assertThat(fichier.estActif()).isTrue();
        assertThat(fichier.estSupprime()).isFalse();
    }

    // ===== TEST 2 : Un fichier SUPPRIME n'est pas actif =====
    @Test
    @DisplayName("Un fichier avec statut SUPPRIME doit retourner estActif=false")
    void fichierSupprime_estActif_retourneFalse() {
        Fichier fichier = creerFichier(StatutFichier.SUPPRIME);
        assertThat(fichier.estActif()).isFalse();
        assertThat(fichier.estSupprime()).isTrue();
    }

    // ===== TEST 3 : marquerCommeSupprime change le statut =====
    @Test
    @DisplayName("marquerCommeSupprime doit changer le statut de ACTIF a SUPPRIME")
    void marquerCommeSupprime_fichierActif_devientSupprime() {
        Fichier fichier = creerFichier(StatutFichier.ACTIF);

        fichier.marquerCommeSupprime();

        assertThat(fichier.estSupprime()).isTrue();
        assertThat(fichier.estActif()).isFalse();
    }

    // ===== TEST 4 : Les proprietes sont correctement initialisees =====
    @Test
    @DisplayName("Le constructeur doit initialiser toutes les proprietes")
    void constructeur_avecParametres_initialiseCorrectement() {
        UUID id = UUID.randomUUID();
        String nom = "photo.jpg";
        String nomOriginal = "photo_original.jpg";
        long taille = 5000L;
        String typeMime = "image/jpeg";
        String cheminStockage = "/uploads/photo.jpg";
        UUID proprietaireId = UUID.randomUUID();
        StatutFichier statut = StatutFichier.ACTIF;
        Instant createdAt = Instant.now();
        Instant updatedAt = Instant.now();

        Fichier fichier = new Fichier(id, nom, nomOriginal, taille, typeMime, cheminStockage,
                proprietaireId, statut, createdAt, updatedAt);

        assertThat(fichier.getId()).isEqualTo(id);
        assertThat(fichier.getNom()).isEqualTo(nom);
        assertThat(fichier.getNomOriginal()).isEqualTo(nomOriginal);
        assertThat(fichier.getTaille()).isEqualTo(taille);
        assertThat(fichier.getTypeMime()).isEqualTo(typeMime);
        assertThat(fichier.getCheminStockage()).isEqualTo(cheminStockage);
        assertThat(fichier.getProprietaireId()).isEqualTo(proprietaireId);
        assertThat(fichier.getStatut()).isEqualTo(statut);
    }
}
