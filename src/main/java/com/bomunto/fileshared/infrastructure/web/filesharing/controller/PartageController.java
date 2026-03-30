package com.bomunto.fileshared.infrastructure.web.filesharing.controller;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;
import com.bomunto.fileshared.domaine.filesharing.port.in.*;
import com.bomunto.fileshared.domaine.filesharing.port.out.FichierRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.LienPartageRepository;
import com.bomunto.fileshared.infrastructure.security.DtfUserDetails;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@Tag(name = "Partage", description = "Partage de fichiers par lien ou avec un utilisateur")
public class PartageController {

    private final PartagerFichierUseCase partagerUseCase;
    private final TelechargerFichierUseCase telechargerUseCase;
    private final LienPartageRepository lienPartageRepository;
    private final FichierRepository fichierRepository;

    public PartageController(PartagerFichierUseCase partagerUseCase,
                             TelechargerFichierUseCase telechargerUseCase,
                             LienPartageRepository lienPartageRepository,
                             FichierRepository fichierRepository) {
        this.partagerUseCase = partagerUseCase;
        this.telechargerUseCase = telechargerUseCase;
        this.lienPartageRepository = lienPartageRepository;
        this.fichierRepository = fichierRepository;
    }

    @PostMapping("/fichiers/{fichierId}/partager/lien")
    @Operation(summary = "Créer un lien de partage pour un fichier")
    public ResponseEntity<LienPartageDto> creerLien(
            @PathVariable UUID fichierId,
            @Valid @RequestBody CreerLienRequest request,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        CreerLienCommand command = new CreerLienCommand(
                fichierId, userId, request.permission(), request.expiration(),
                request.motDePasse()
        );
        LienPartage lien = partagerUseCase.partagerParLien(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LienPartageDto.from(lien));
    }

    @PostMapping("/fichiers/{fichierId}/partager/utilisateur")
    @Operation(summary = "Partager un fichier avec un utilisateur")
    public ResponseEntity<Void> partagerAvecUtilisateur(
            @PathVariable UUID fichierId,
            @Valid @RequestBody PartagerRequest request,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        PartagerCommand command = new PartagerCommand(
                fichierId, userId, request.destinataireId(), request.permission()
        );
        partagerUseCase.partagerAvecUtilisateur(command);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/fichiers/{fichierId}/partages")
    @Operation(summary = "Lister les partages actifs d'un fichier")
    public ResponseEntity<PartagesResponse> listerPartages(
            @PathVariable UUID fichierId,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        PartagesResult result = partagerUseCase.listerPartages(fichierId, userId);

        var liensDto = result.liens().stream().map(LienPartageDto::from).toList();
        var utilisateursDto = result.utilisateurs().stream().map(PartageUtilisateurDto::from).toList();

        return ResponseEntity.ok(new PartagesResponse(liensDto, utilisateursDto));
    }

    @GetMapping("/partages/{token}/info")
    @Operation(summary = "Obtenir les informations d'un lien de partage")
    public ResponseEntity<Map<String, Object>> infoLien(@PathVariable String token) {
        // Récupérer le lien
        var lien = lienPartageRepository.findByToken(token)
                .orElseThrow(() -> new com.bomunto.fileshared.domaine.filesharing.exception.FichierIntrouvableException(null));

        if (!lien.estValide()) {
            throw new com.bomunto.fileshared.domaine.filesharing.exception.LienExpireException();
        }

        // Récupérer le fichier pour les métadonnées
        var fichier = fichierRepository.findById(lien.getFichierId())
                .orElseThrow(() -> new com.bomunto.fileshared.domaine.filesharing.exception.FichierIntrouvableException(lien.getFichierId()));

        return ResponseEntity.ok(Map.of(
                "nom", fichier.getNomOriginal(),
                "taille", fichier.getTaille(),
                "typeMime", fichier.getTypeMime(),
                "protegeParMotDePasse", lien.estProtegePArMotDePasse(),
                "permission", lien.getPermission().name()
        ));
    }

    @GetMapping("/partages/{token}")
    @Operation(summary = "Télécharger un fichier via un lien de partage")
    public ResponseEntity<Resource> telechargerParLien(@PathVariable String token) {
        FichierContenu contenu = telechargerUseCase.telechargerParToken(token);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contenu.typeMime()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + contenu.nom() + "\"")
                .body(new InputStreamResource(contenu.contenu()));
    }

    @PostMapping("/partages/{token}/telecharger")
    @Operation(summary = "Télécharger un fichier via un lien de partage avec mot de passe")
    public ResponseEntity<Resource> telechargerAvecMotDePasse(
            @PathVariable String token,
            @RequestBody(required = false) Map<String, String> body) {

        String motDePasse = (body != null) ? body.get("motDePasse") : null;
        FichierContenu contenu = telechargerUseCase.telechargerParTokenAvecMotDePasse(token, motDePasse);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contenu.typeMime()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + contenu.nom() + "\"")
                .body(new InputStreamResource(contenu.contenu()));
    }

    @DeleteMapping("/partages/{partageId}")
    @Operation(summary = "Révoquer un partage")
    public ResponseEntity<Void> revoquer(
            @PathVariable UUID partageId,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        partagerUseCase.revoquerPartage(partageId, userId);
        return ResponseEntity.noContent().build();
    }
}
