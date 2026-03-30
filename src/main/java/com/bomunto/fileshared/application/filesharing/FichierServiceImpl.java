package com.bomunto.fileshared.application.filesharing;

import com.bomunto.fileshared.domaine.common.PageResult;
import com.bomunto.fileshared.domaine.filesharing.*;
import com.bomunto.fileshared.domaine.filesharing.exception.AccesRefuseException;
import com.bomunto.fileshared.domaine.filesharing.exception.FichierIntrouvableException;
import com.bomunto.fileshared.domaine.filesharing.exception.LienExpireException;
import com.bomunto.fileshared.domaine.filesharing.exception.QuotaDepasseException;
import com.bomunto.fileshared.domaine.filesharing.port.in.*;
import com.bomunto.fileshared.domaine.filesharing.port.out.ActiviteLogRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.FichierRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.FileStorage;
import com.bomunto.fileshared.domaine.filesharing.port.out.LienPartageRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.PartageUtilisateurRepository;
import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.domaine.identity.port.out.EmailService;
import com.bomunto.fileshared.domaine.identity.port.out.PasswordHasher;
import com.bomunto.fileshared.domaine.identity.port.out.UtilisateurRepository;
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
public class FichierServiceImpl implements UploadFichierUseCase, TelechargerFichierUseCase, ListerFichierUseCase, SupprimerFichierUseCase, PartagerFichierUseCase, RenommerFichierUseCase {

    private static final long QUOTA_MAX = 100L * 1024 * 1024; // 100 MB

    private final FichierRepository fichierRepository;
    private final FileStorage fileStorage;
    private final PartageUtilisateurRepository partageUtilisateurRepository;
    private final LienPartageRepository lienPartageRepository;
    private final PasswordHasher passwordHasher;
    private final ActiviteLogRepository activiteLogRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EmailService emailService;

    @Autowired
    public FichierServiceImpl(FichierRepository fichierRepository, FileStorage fileStorage,
                              PartageUtilisateurRepository partageUtilisateurRepository,
                              LienPartageRepository lienPartageRepository,
                              PasswordHasher passwordHasher,
                              ActiviteLogRepository activiteLogRepository,
                              UtilisateurRepository utilisateurRepository,
                              EmailService emailService) {
        this.fichierRepository = fichierRepository;
        this.fileStorage = fileStorage;
        this.partageUtilisateurRepository = partageUtilisateurRepository;
        this.lienPartageRepository = lienPartageRepository;
        this.passwordHasher = passwordHasher;
        this.activiteLogRepository = activiteLogRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.emailService = emailService;
    }

    /**
     * Methode pour gerer l'upload d'un fichier
     * 1. Verifie le quota de stockage de l'utilisateur
     * 2. Stocke le fichier dans le systeme de fichiers via FileStorage
     * 3. Cree une entite Fichier avec les informations fournies et le chemin de stockage
     * 4. Sauvegarde l'entite Fichier dans la base de donnees via FichierRepository
     * 5. Journalise l'activite
     * 6. Retourne un resultat contenant les informations du fichier sauvegarde
     * @param cmd Commande contenant les informations necessaires pour l'upload du fichier
     * @return FichierResult contenant les informations du fichier uploade
     */
    @Transactional
    public FichierResult upload(UploadFichierCommand cmd) {

        // Verification du quota
        long espaceUtilise = fichierRepository.calculerEspaceUtilise(cmd.proprietaireId());
        if (espaceUtilise + cmd.taille() > QUOTA_MAX) {
            throw new QuotaDepasseException();
        }

        // Stockage du fichier dans le systeme de fichiers
        String cheminStockage = fileStorage.stocker(cmd.nom(), cmd.contenu());
         // Creation de l'entite Fichier avec les informations fournies et le chemin de stockage
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

        // Journaliser l'activite
        logActivite(cmd.proprietaireId(), "UPLOAD", saved.getId(), "Fichier " + cmd.nom() + " uploade");

        return new FichierResult(saved);
    }

    /**
     * Methode pour gerer le telechargement d'un fichier
     */
    @Override
    public FichierContenu telecharger(TelechargerCommand command) {

        // Recuperer le fichier depuis la base de donnees
        Fichier fichier = fichierRepository.findById(command.fichierId())
                .orElseThrow(() -> new FichierIntrouvableException(command.fichierId()));

        // Verifier que le fichier est actif
        if(!fichier.estActif()) {
            throw new FichierIntrouvableException(command.fichierId());
        }
        // Verifier que l'utilisateur est le proprietaire du fichier
        boolean estProprietaire = fichier.getProprietaireId().equals(command.utilisateurId());

        // Verifier les partages d'utilisateurs pour voir si l'utilisateur a un partage avec droit de telechargement
        boolean aUnPartage = partageUtilisateurRepository.findByDestinataire(command.utilisateurId())
                .stream()
                .anyMatch(partage -> partage.getFichierId().equals(command.fichierId()));

        // Si l'utilisateur n'est ni le proprietaire ni un destinataire de partage, refuser l'acces
        if(!estProprietaire && !aUnPartage) {
            throw new AccesRefuseException();
        }

        // Recuperer le contenu du fichier depuis le systeme de fichiers
        InputStream contenu = fileStorage.recuperer(fichier.getCheminStockage());

        // Journaliser l'activite
        logActivite(command.utilisateurId(), "TELECHARGER", command.fichierId(), "Fichier " + fichier.getNom() + " telecharge");

        // Retourner un FichierContenu avec les informations et le flux de donnees du fichier
        return new FichierContenu(fichier.getNomOriginal(), fichier.getTypeMime(), contenu);
    }


    /**
     * Methode pour lister les fichiers d'un utilisateur
     */
    @Override
    public List<Fichier> listerFichiers(UUID proprietaireId) {
        return fichierRepository.findByProprietaireId(proprietaireId)
                .stream()
                .filter(Fichier::estActif)
                .toList();
    }

    @Override
    public PageResult<Fichier> listerFichiersPagines(UUID proprietaireId, int page, int size) {
        PageResult<Fichier> result = fichierRepository.findByProprietaireIdPagine(proprietaireId, page, size);
        List<Fichier> actifs = result.contenu().stream().filter(Fichier::estActif).toList();
        return new PageResult<>(actifs, result.page(), result.size(), result.totalElements(), result.totalPages());
    }

    /**
     * Methode pour lister les fichiers partages avec un utilisateur
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
     * Methode pour supprimer un fichier
     */
    @Override
    public void supprimer(UUID fichierId, UUID utilisateurId) {
        Fichier fichier = fichierRepository.findById(fichierId)
                .orElseThrow(() -> new FichierIntrouvableException(fichierId));

        if(!fichier.getProprietaireId().equals(utilisateurId)) {
            throw new AccesRefuseException();
        }
        //Soft delete : on change le statut du fichier a SUPPRIME au lieu de le supprimer physiquement
        fichier.marquerCommeSupprime();
        fichierRepository.save(fichier);

        // Journaliser l'activite
        logActivite(utilisateurId, "SUPPRIMER", fichierId, "Fichier " + fichier.getNom() + " supprime");
    }

    @Override
    public FichierContenu telechargerParToken(String token) {
        // 1. Recuperer le lien de partage via le token
        LienPartage lien = lienPartageRepository.findByToken(token)
                .orElseThrow(() -> new FichierIntrouvableException(null));

        // 2. Verifier que le lien est valide (actif et non expire)
        if (!lien.estValide()) {
            throw new LienExpireException();
        }

        // 3. Recuperer le fichier
        Fichier fichier = fichierRepository.findById(lien.getFichierId())
                .orElseThrow(() -> new FichierIntrouvableException(lien.getFichierId()));

        if (!fichier.estActif()) {
            throw new FichierIntrouvableException(lien.getFichierId());
        }

        // 4. Recuperer le contenu et retourner
        InputStream contenu = fileStorage.recuperer(fichier.getCheminStockage());
        return new FichierContenu(fichier.getNomOriginal(), fichier.getTypeMime(), contenu);
    }

    @Override
    public LienPartage partagerParLien(CreerLienCommand command) {
        Fichier fichier = fichierRepository.findById(command.fichierId())
                .orElseThrow(() -> new FichierIntrouvableException(command.fichierId()));

            // Verifier que l'utilisateur est le proprietaire du fichier
        if(!fichier.getProprietaireId().equals(command.proprietaireId())) {
            throw new AccesRefuseException();
        }
        // Hacher le mot de passe si fourni
        String motDePasseHash = (command.motDePasse() != null && !command.motDePasse().isBlank())
                ? passwordHasher.hash(command.motDePasse())
                : null;

        // Creer un lien de partage
        LienPartage lienPartage = new LienPartage(
                null, // id
                command.fichierId(),
                UUID.randomUUID().toString(), // token unique
                command.permission(),
                command.expiration(),
                true, // actif
                command.proprietaireId(),
                motDePasseHash,
                Instant.now(),
                Instant.now()
        );

        LienPartage saved = lienPartageRepository.save(lienPartage);

        // Journaliser l'activite
        logActivite(command.proprietaireId(), "PARTAGER_LIEN", command.fichierId(), "Lien de partage cree pour " + fichier.getNom());

        return saved;
    }

    @Override
    public PartageUtilisateur partagerAvecUtilisateur(PartagerCommand command) {

        Fichier fichier = fichierRepository.findById(command.fichierId())
                .orElseThrow(() -> new FichierIntrouvableException(command.fichierId()));

        // Verifier que l'utilisateur est le proprietaire du fichier
        if(!fichier.getProprietaireId().equals(command.proprietaireId())) {
            throw new AccesRefuseException();
        }
        // Creer un partage utilisateur
        PartageUtilisateur partageUtilisateur = new PartageUtilisateur(
                null, // id
                command.fichierId(),
                command.destinataireId(),
                command.permission(),
                Instant.now(),
                Instant.now()
        );

        PartageUtilisateur saved = partageUtilisateurRepository.save(partageUtilisateur);

        // Journaliser l'activite
        logActivite(command.proprietaireId(), "PARTAGER_UTILISATEUR", command.fichierId(), "Fichier " + fichier.getNom() + " partage avec un utilisateur");

        // Envoyer notification email au destinataire
        try {
            utilisateurRepository.findById(command.destinataireId()).ifPresent(destinataire -> {
                utilisateurRepository.findById(command.proprietaireId()).ifPresent(proprietaire -> {
                    emailService.envoyerNotificationPartage(
                            destinataire.getEmail(),
                            fichier.getNom(),
                            proprietaire.getUsername()
                    );
                });
            });
        } catch (Exception e) {
            // L'echec de l'envoi d'email ne doit pas bloquer le partage
        }

        return saved;
    }

    @Override
    public void revoquerPartage(UUID partageId, UUID utilisateurId) {
        // Recuperer le partage
        PartageUtilisateur partage = partageUtilisateurRepository.findById(partageId)
                .orElseThrow(() -> new FichierIntrouvableException(partageId));

        // Verifier que l'utilisateur est le proprietaire du fichier partage
        Fichier fichier = fichierRepository.findById(partage.getFichierId())
                .orElseThrow(() -> new FichierIntrouvableException(partage.getFichierId()));

        if (!fichier.getProprietaireId().equals(utilisateurId)) {
            throw new AccesRefuseException();
        }

        partageUtilisateurRepository.delete(partageId);

        // Journaliser l'activite
        logActivite(utilisateurId, "REVOQUER", partage.getFichierId(), "Partage revoque pour " + fichier.getNom());
    }

    @Override
    public FichierContenu telechargerParTokenAvecMotDePasse(String token, String motDePasse) {
        // 1. Recuperer le lien de partage via le token
        LienPartage lien = lienPartageRepository.findByToken(token)
                .orElseThrow(() -> new FichierIntrouvableException(null));

        // 2. Verifier que le lien est valide (actif et non expire)
        if (!lien.estValide()) {
            throw new LienExpireException();
        }

        // 3. Verifier le mot de passe si le lien est protege
        if (lien.estProtegePArMotDePasse()) {
            if (motDePasse == null || !passwordHasher.matches(motDePasse, lien.getMotDePasse())) {
                throw new AccesRefuseException();
            }
        }

        // 4. Recuperer le fichier
        Fichier fichier = fichierRepository.findById(lien.getFichierId())
                .orElseThrow(() -> new FichierIntrouvableException(lien.getFichierId()));

        if (!fichier.estActif()) {
            throw new FichierIntrouvableException(lien.getFichierId());
        }

        // 5. Recuperer le contenu et retourner
        InputStream contenu = fileStorage.recuperer(fichier.getCheminStockage());
        return new FichierContenu(fichier.getNomOriginal(), fichier.getTypeMime(), contenu);
    }

    @Override
    public PartagesResult listerPartages(UUID fichierId, UUID proprietaireId) {
        Fichier fichier = fichierRepository.findById(fichierId)
                .orElseThrow(() -> new FichierIntrouvableException(fichierId));

        if (!fichier.getProprietaireId().equals(proprietaireId)) {
            throw new AccesRefuseException();
        }

        List<LienPartage> liens = lienPartageRepository.findByFichierId(fichierId);
        List<PartageUtilisateur> utilisateurs = partageUtilisateurRepository.findByFichierId(fichierId);

        return new PartagesResult(liens, utilisateurs);
    }

    @Override
    @Transactional
    public Fichier renommer(UUID fichierId, UUID utilisateurId, String nouveauNom) {
        Fichier fichier = fichierRepository.findById(fichierId)
                .orElseThrow(() -> new FichierIntrouvableException(fichierId));

        if (!fichier.getProprietaireId().equals(utilisateurId)) {
            throw new AccesRefuseException();
        }

        if (!fichier.estActif()) {
            throw new FichierIntrouvableException(fichierId);
        }

        String ancienNom = fichier.getNom();
        fichier.renommer(nouveauNom);
        Fichier saved = fichierRepository.save(fichier);

        // Journaliser l'activite
        logActivite(utilisateurId, "RENOMMER", fichierId, "Fichier renomme de " + ancienNom + " en " + nouveauNom);

        return saved;
    }

    /**
     * Methode utilitaire pour journaliser une activite.
     */
    private void logActivite(UUID utilisateurId, String action, UUID fichierId, String details) {
        ActiviteLog log = new ActiviteLog(
                null,
                utilisateurId,
                action,
                fichierId,
                details,
                Instant.now(),
                Instant.now()
        );
        activiteLogRepository.save(log);
    }
}
