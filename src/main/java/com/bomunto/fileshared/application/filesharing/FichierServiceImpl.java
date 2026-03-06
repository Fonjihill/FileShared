package com.bomunto.fileshared.application.filesharing;

import com.bomunto.fileshared.domaine.filesharing.Fichier;
import com.bomunto.fileshared.domaine.filesharing.StatutFichier;
import com.bomunto.fileshared.domaine.filesharing.exception.AccesRefuseException;
import com.bomunto.fileshared.domaine.filesharing.exception.FichierIntrouvableException;
import com.bomunto.fileshared.domaine.filesharing.port.in.*;
import com.bomunto.fileshared.domaine.filesharing.port.out.FichierRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.FileStorage;
import com.bomunto.fileshared.domaine.filesharing.port.out.PartageUtilisateurRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@Service
public class FichierServiceImpl implements UploadFichierUseCase, TelechargerFichierUseCase, ListerFichierUseCase, SupprimerFichierUseCase{

    private final FichierRepository fichierRepository;
    private final FileStorage fileStorage;
    private final PartageUtilisateurRepository partageUtilisateurRepository;

    @Autowired
    public FichierServiceImpl(FichierRepository fichierRepository, FileStorage fileStorage, PartageUtilisateurRepository partageUtilisateurRepository) {
        this.fichierRepository = fichierRepository;
        this.fileStorage = fileStorage;
        this.partageUtilisateurRepository = partageUtilisateurRepository;
    }

    /**
     * Méthode pour gérer l'upload d'un fichier
     * 1. Stocke le fichier dans le système de fichiers via FileStorage
     * 2. Crée une entité Fichier avec les informations fournies et le chemin de stockage
     * 3. Sauvegarde l'entité Fichier dans la base de données via FichierRepository
     * 4. Retourne un résultat contenant les informations du fichier sauvegardé
     * @param cmd Commande contenant les informations nécessaires pour l'upload du fichier
     * @return FichierResult contenant les informations du fichier uploadé
     */
    @Transactional
    public FichierResult upload(UploadFichierCommand cmd) {

        // Stockage du fichier dans le système de fichiers
        String cheminStockage = fileStorage.stocker(cmd.nom(), cmd.contenu());
         // Création de l'entité Fichier avec les informations fournies et le chemin de stockage
        Fichier fichier = new Fichier(
                null,                 // id
                cmd.nom(),               // nom
                cmd.nom(),               // nomOriginal
                cmd.taille(),            // taille
                cmd.typeMime(),          // typeMime
                cheminStockage,          // cheminStockage
                cmd.proprietaireId(),    // proprietaireId
                StatutFichier.ACTIF,     // statut
                Instant.now(),           // createdAt
                Instant.now()            // updatedAt
        );

        Fichier saved = fichierRepository.save(fichier);
        return new FichierResult(saved);
    }

    /**
     * Méthode pour gérer le téléchargement d'un fichier
     * 1. Récupère l'entité Fichier depuis la base de données via FichierRepository
     * 2. Vérifie que le fichier est actif et que l'utilisateur a les droits d'accès (propriétaire ou partage)
     * 3. Récupère le contenu du fichier depuis le système de fichiers via FileStorage
     * 4. Retourne un FichierContenu contenant les informations et le flux de données du fichier
     * @param command Commande contenant les informations nécessaires pour le téléchargement du fichier
     * @return FichierContenu contenant les informations et le flux de données du fichier téléchargé
     */
    @Override
    public FichierContenu telecharger(TelechargerCommand command) {

        Fichier fichier = fichierRepository.findById(command.fichierId())
                .orElseThrow(() -> new FichierIntrouvableException(command.fichierId()));

        // Vérifier que le fichier est actif
        if(!fichier.estActif()) {
            throw new FichierIntrouvableException(command.fichierId());
        }

        boolean estProprietaire = fichier.getProprietaireId().equals(command.utilisateurId());
        boolean aUnPartage = partageUtilisateurRepository.findByDestinataire(command.utilisateurId())
                .stream()
                .anyMatch(partage -> partage.getFichierId().equals(command.fichierId()));

        if(!estProprietaire && !aUnPartage) {
            throw new AccesRefuseException();
        }

        InputStream contenu = fileStorage.recuperer(fichier.getCheminStockage());
        return new FichierContenu(fichier.getNomOriginal(), fichier.getTypeMime(), contenu);
    }


    /**
     * Méthode pour lister les fichiers d'un utilisateur
     * 1. Récupère la liste des fichiers appartenant à l'utilisateur depuis la base de données via FichierRepository
     * 2. Filtre les fichiers pour ne retourner que ceux qui sont actifs
     * 3. Retourne la liste des fichiers actifs de l'utilisateur
     * @param proprietaireId L'identifiant de l'utilisateur dont on veut lister les fichiers
     * @return Liste des fichiers actifs appartenant à l'utilisateur
     */
    @Override
    public List<Fichier> listerFichiers(UUID proprietaireId) {
        return fichierRepository.findByProprietaireId(proprietaireId)
                .stream()
                .filter(Fichier::estActif)
                .toList();
    }

    /**
     * Méthode pour lister les fichiers partagés avec un utilisateur
     * 1. Récupère la liste des partages d'utilisateurs où le destinataire est l'utilisateur donné depuis la base de données via PartageUtilisateurRepository
     * 2. Pour chaque partage, récupère le fichier correspondant depuis la base de données via FichierRepository
     * 3. Filtre les fichiers pour ne retourner que ceux qui sont actifs
     * 4. Retourne la liste des fichiers actifs partagés avec l'utilisateur
     * @param utilisateurId L'identifiant de l'utilisateur pour lequel on veut lister les fichiers partagés avec lui
     * @return Liste des fichiers actifs partagés avec l'utilisateur
     */
    @Override
    public List<Fichier> listerFichiersPartagesAvecMoi(UUID utilisateurId) {
        return partageUtilisateurRepository.findByDestinataire(utilisateurId)
                .stream()
                .map(partage -> fichierRepository.findById(partage.getFichierId())
                        .filter(Fichier::estActif)
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(toList());
    }

    /**
     * Méthode pour supprimer un fichier
     * 1. Récupère l'entité Fichier depuis la base de données via FichierRepository
     * 2. Vérifie que l'utilisateur est le propriétaire du fichier
     * 3. Marque le fichier comme supprimé en changeant son statut à SUPPRIME
     * 4. Sauvegarde les modifications de l'entité Fichier dans la base de données via FichierRepository
     * @param fichierId L'identifiant du fichier à supprimer
     * @param utilisateurId L'identifiant de l'utilisateur qui tente de supprimer le fichier
     */
    @Override
    public void supprimer(UUID fichierId, UUID utilisateurId) {
        Fichier fichier = fichierRepository.findById(fichierId)
                .orElseThrow(() -> new FichierIntrouvableException(fichierId));

        if(!fichier.getProprietaireId().equals(utilisateurId)) {
            throw new AccesRefuseException();
        }
        //Soft delete : on change le statut du fichier à SUPPRIME au lieu de le supprimer physiquement
        fichier.marquerCommeSupprime();
        fichierRepository.save(fichier);
    }

    @Override
    public FichierContenu telechargerParToken(String token) {
        return null;
    }
}
