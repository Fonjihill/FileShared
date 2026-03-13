package com.bomunto.fileshared.application.filesharing;

import com.bomunto.fileshared.domaine.filesharing.Fichier;
import com.bomunto.fileshared.domaine.filesharing.StatutFichier;
import com.bomunto.fileshared.domaine.filesharing.exception.AccesRefuseException;
import com.bomunto.fileshared.domaine.filesharing.exception.FichierIntrouvableException;
import com.bomunto.fileshared.domaine.filesharing.port.out.FichierRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.FileStorage;
import com.bomunto.fileshared.domaine.filesharing.port.out.PartageUtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bomunto.fileshared.domaine.filesharing.PartageUtilisateur;
import com.bomunto.fileshared.domaine.filesharing.Permission;
import com.bomunto.fileshared.domaine.filesharing.port.in.FichierContenu;
import com.bomunto.fileshared.domaine.filesharing.port.in.FichierResult;
import com.bomunto.fileshared.domaine.filesharing.port.in.TelechargerCommand;
import com.bomunto.fileshared.domaine.filesharing.port.in.UploadFichierCommand;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)   // Active Mockito
class FichierServiceImplTest {

    @Mock                               // Faux repository (pas de vraie BDD)
    private FichierRepository fichierRepository;

    @Mock                               // Faux stockage (pas de vrai disque)
    private FileStorage fileStorage;

    @Mock                               // Faux repository partages
    private PartageUtilisateurRepository partageUtilisateurRepository;

    @InjectMocks                        // Cree le service avec les 3 mocks injectes
    private FichierServiceImpl service;

    // --- Utilitaire ---
    private Fichier creerFichier(UUID id, UUID proprietaireId, StatutFichier statut) {
        return new Fichier(id, "rapport.pdf", "rapport.pdf", 2500L,
                "application/pdf", "/uploads/rapport.pdf", proprietaireId,
                statut, Instant.now(), Instant.now());
    }

    // ================================================================
    // supprimer()
    // ================================================================

    @Test
    @DisplayName("supprimer - le proprietaire peut supprimer son fichier (soft delete)")
    void supprimer_proprietaire_marqueCommeSupprime() {
        UUID fichierId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Fichier fichier = creerFichier(fichierId, userId, StatutFichier.ACTIF);

        //When
        when(fichierRepository.findById(fichierId)).thenReturn(Optional.of(fichier));

        // Act :
        service.supprimer(fichierId, userId);
        //
        // Assert :
        assertThat(fichier.estSupprime()).isTrue();
        verify(fichierRepository).save(fichier);
    }

    @Test
    @DisplayName("supprimer - fichier introuvable leve FichierIntrouvableException")
    void supprimer_fichierInexistant_leveException() {
        UUID fichierId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(fichierRepository.findById(fichierId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.supprimer(fichierId, userId))
            .isInstanceOf(FichierIntrouvableException.class);
    }

    @Test
    @DisplayName("supprimer - un non-proprietaire ne peut pas supprimer, leve AccesRefuseException")
    void supprimer_nonProprietaire_leveAccesRefuse() {
        UUID fichierId = UUID.randomUUID();
        UUID proprietaireId = UUID.randomUUID();
        UUID intrusId = UUID.randomUUID();

        Fichier fichierActif = creerFichier(fichierId, proprietaireId, StatutFichier.ACTIF);
        when(fichierRepository.findById(fichierId)).thenReturn(Optional.of(fichierActif));

        assertThatThrownBy(() -> service.supprimer(fichierId, intrusId))
            .isInstanceOf(AccesRefuseException.class);
    }

    // ================================================================
    // upload()
    // ================================================================

    @Test
    @DisplayName("upload - stocke le fichier et sauvegarde l'entite")
    void upload_fichierValide_stockeEtSauvegarde() {

        InputStream contenu = new ByteArrayInputStream("contenu".getBytes());
        UploadFichierCommand cmd = new UploadFichierCommand("doc.pdf", "application/pdf", 1000L, contenu, UUID.randomUUID());

        when(fileStorage.stocker(eq("doc.pdf"), any(InputStream.class))).thenReturn("/uploads/doc.pdf");
        when(fichierRepository.save(any(Fichier.class))).thenAnswer(i -> i.getArgument(0));

        FichierResult result = service.upload(cmd);

        assertThat(result).isNotNull();
        assertThat(result.fichier().getNom()).isEqualTo("doc.pdf");
        assertThat(result.fichier().getStatut()).isEqualTo(StatutFichier.ACTIF);
        verify(fileStorage).stocker(eq("doc.pdf"), any(InputStream.class));
        verify(fichierRepository).save(any(Fichier.class));
    }

    // ================================================================
    // telecharger()
    // ================================================================

    @Test
    @DisplayName("telecharger - le proprietaire peut telecharger son fichier")
    void telecharger_proprietaire_retourneContenu() {
        // TODO: A toi !
        // Arrange :
        UUID fichierId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        when(fichierRepository.findById(fichierId)).thenReturn(Optional.of(creerFichier(fichierId, userId, StatutFichier.ACTIF)));
        when(fileStorage.recuperer("/uploads/rapport.pdf")).thenReturn(new ByteArrayInputStream("data".getBytes()));

        FichierContenu contenu = service.telecharger(new TelechargerCommand(fichierId, userId));

        assertThat(contenu).isNotNull();
        assertThat(contenu.nom()).isEqualTo("rapport.pdf");
        assertThat(contenu.typeMime()).isEqualTo("application/pdf");
    }

    @Test
    @DisplayName("telecharger - un destinataire de partage peut telecharger")
    void telecharger_destinatairePartage_retourneContenu() {
        // Arrange :
        UUID fichierId = UUID.randomUUID();
        UUID proprietaireId = UUID.randomUUID();
        UUID destinataireId = UUID.randomUUID();

        PartageUtilisateur partage = new PartageUtilisateur(UUID.randomUUID(), fichierId, destinataireId, Permission.TELECHARGEMENT, Instant.now(), Instant.now());
        Fichier fichierActif = creerFichier(fichierId, proprietaireId, StatutFichier.ACTIF);

        when(fichierRepository.findById(fichierId)).thenReturn(Optional.of(fichierActif));
        when(partageUtilisateurRepository.findByDestinataire(destinataireId)).thenReturn(List.of(partage));
        when(fileStorage.recuperer("/uploads/rapport.pdf")).thenReturn(new ByteArrayInputStream("data".getBytes()));

        FichierContenu commande = service.telecharger(new TelechargerCommand(fichierId, destinataireId));

        assertThat(commande).isNotNull();
    }

    @Test
    @DisplayName("telecharger - fichier supprime leve FichierIntrouvableException")
    void telecharger_fichierSupprime_leveException() {
        Fichier fichierSupprimer = creerFichier(UUID.randomUUID(), UUID.randomUUID(), StatutFichier.SUPPRIME);
        when(fichierRepository.findById(fichierSupprimer.getId())).thenReturn(Optional.of(fichierSupprimer));

         assertThatThrownBy(() -> service.telecharger(new TelechargerCommand(fichierSupprimer.getId(), UUID.randomUUID())))
            .isInstanceOf(FichierIntrouvableException.class);
    }

    @Test
    @DisplayName("telecharger - ni proprietaire ni destinataire leve AccesRefuseException")
    void telecharger_aucunDroit_leveAccesRefuse() {
        UUID fichierId = UUID.randomUUID();
        UUID proprietaireId = UUID.randomUUID();
        UUID intrusId = UUID.randomUUID();

        Fichier fichierActif = creerFichier(fichierId, proprietaireId, StatutFichier.ACTIF);
        when(fichierRepository.findById(fichierId)).thenReturn(Optional.of(fichierActif));
        when(partageUtilisateurRepository.findByDestinataire(intrusId)).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> service.telecharger(new TelechargerCommand(fichierId, intrusId)))
                .isInstanceOf(AccesRefuseException.class);
    }

    // ================================================================
    // listerFichiers()
    // ================================================================

    @Test
    @DisplayName("listerFichiers - retourne uniquement les fichiers actifs")
    void listerFichiers_avecActifsEtSupprimes_retourneQueActifs() {
        UUID userId = UUID.randomUUID();
        Fichier fichier1 = creerFichier(UUID.randomUUID(), userId, StatutFichier.ACTIF);
        Fichier fichier2 = creerFichier(UUID.randomUUID(), userId, StatutFichier.ACTIF);
        Fichier fichier3 = creerFichier(UUID.randomUUID(), userId, StatutFichier.SUPPRIME);

        when(fichierRepository.findByProprietaireId(userId)).thenReturn(List.of(fichier1, fichier2, fichier3));
        List<Fichier> resultat = service.listerFichiers(userId);

        assertThat(resultat).hasSize(2);
        assertThat(resultat).allMatch(Fichier::estActif);
    }

    @Test
    @DisplayName("listerFichiers - retourne une liste vide si aucun fichier")
    void listerFichiers_aucunFichier_retourneListeVide() {
        when(fichierRepository.findByProprietaireId(any(UUID.class))).thenReturn(Collections.emptyList());

        List<Fichier> resultat = service.listerFichiers(UUID.randomUUID());

        assertThat(resultat).isEmpty();
    }

    // ================================================================
    // listerFichiersPartagesAvecMoi()
    // ================================================================

    @Test
    @DisplayName("listerFichiersPartagesAvecMoi - retourne les fichiers partages actifs")
    void listerPartages_avecPartages_retourneFichiersActifs() {
        UUID destinataireId = UUID.randomUUID();
        UUID proprietaireId = UUID.randomUUID();

        Fichier fichier1 = creerFichier(UUID.randomUUID(), proprietaireId, StatutFichier.ACTIF);
        Fichier fichier2 = creerFichier(UUID.randomUUID(), proprietaireId, StatutFichier.ACTIF);

        PartageUtilisateur partage1 = new PartageUtilisateur(UUID.randomUUID(), fichier1.getId(), destinataireId, Permission.TELECHARGEMENT, Instant.now(), Instant.now());
        PartageUtilisateur partage2 = new PartageUtilisateur(UUID.randomUUID(), fichier2.getId(), destinataireId, Permission.TELECHARGEMENT, Instant.now(), Instant.now());

        when(partageUtilisateurRepository.findByDestinataire(destinataireId)).thenReturn(List.of(partage1, partage2));
        when(fichierRepository.findById(fichier1.getId())).thenReturn(Optional.of(fichier1));
        when(fichierRepository.findById(fichier2.getId())).thenReturn(Optional.of(fichier2));

         List<Fichier> resultat = service.listerFichiersPartagesAvecMoi(destinataireId);

         assertThat(resultat).hasSize(2);
    }

    @Test
    @DisplayName("listerFichiersPartagesAvecMoi - exclut les fichiers supprimes")
    void listerPartages_fichierSupprime_exclutDuResultat() {
        UUID destinataireId = UUID.randomUUID();

        Fichier fichier = creerFichier(UUID.randomUUID(), UUID.randomUUID(), StatutFichier.SUPPRIME);
        PartageUtilisateur partage = new PartageUtilisateur(UUID.randomUUID(), fichier.getId(), destinataireId, Permission.TELECHARGEMENT, Instant.now(), Instant.now());

        when(partageUtilisateurRepository.findByDestinataire(destinataireId)).thenReturn(List.of(partage));
        when(fichierRepository.findById(fichier.getId())).thenReturn(Optional.of(fichier));

        List<Fichier> resultat = service.listerFichiersPartagesAvecMoi(destinataireId);

        assertThat(resultat).isEmpty();
    }
}
