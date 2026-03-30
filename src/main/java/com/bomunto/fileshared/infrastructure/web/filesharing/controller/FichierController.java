package com.bomunto.fileshared.infrastructure.web.filesharing.controller;

import com.bomunto.fileshared.domaine.common.PageResult;
import com.bomunto.fileshared.domaine.filesharing.ActiviteLog;
import com.bomunto.fileshared.domaine.filesharing.Fichier;
import com.bomunto.fileshared.domaine.filesharing.port.in.*;
import com.bomunto.fileshared.domaine.filesharing.port.out.ActiviteLogRepository;
import com.bomunto.fileshared.domaine.filesharing.port.out.FichierRepository;
import com.bomunto.fileshared.infrastructure.security.DtfUserDetails;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.ActiviteLogDto;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.FichierDto;
import com.bomunto.fileshared.infrastructure.web.filesharing.mapper.FichierWebMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/fichiers")
@Tag(name = "Fichiers", description = "Upload, telechargement, liste et suppression de fichiers")
public class FichierController {

    private final UploadFichierUseCase uploadUseCase;
    private final ListerFichierUseCase listerUseCase;
    private final TelechargerFichierUseCase telechargerUseCase;
    private final SupprimerFichierUseCase supprimerUseCase;
    private final RenommerFichierUseCase renommerUseCase;
    private final FichierRepository fichierRepository;
    private final ActiviteLogRepository activiteLogRepository;

    public FichierController(UploadFichierUseCase uploadUseCase,
                             ListerFichierUseCase listerUseCase,
                             TelechargerFichierUseCase telechargerUseCase,
                             SupprimerFichierUseCase supprimerUseCase,
                             RenommerFichierUseCase renommerUseCase,
                             FichierRepository fichierRepository,
                             ActiviteLogRepository activiteLogRepository) {
        this.uploadUseCase = uploadUseCase;
        this.listerUseCase = listerUseCase;
        this.telechargerUseCase = telechargerUseCase;
        this.supprimerUseCase = supprimerUseCase;
        this.renommerUseCase = renommerUseCase;
        this.fichierRepository = fichierRepository;
        this.activiteLogRepository = activiteLogRepository;
    }

    @PostMapping
    @Operation(summary = "Uploader un fichier")
    public ResponseEntity<FichierDto> upload(
            @RequestParam("fichier") MultipartFile fichier,
            @AuthenticationPrincipal DtfUserDetails userDetails) throws Exception {

        UUID userId = userDetails.getId();
        UploadFichierCommand command = FichierWebMapper.toUploadCommand(fichier, userId);
        FichierResult result = uploadUseCase.upload(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(FichierDto.from(result.fichier()));
    }

    @GetMapping
    @Operation(summary = "Lister mes fichiers (pagine)")
    public ResponseEntity<?> lister(
            @AuthenticationPrincipal DtfUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UUID userId = userDetails.getId();
        PageResult<Fichier> result = listerUseCase.listerFichiersPagines(userId, page, size);
        var dto = new PageResult<>(
                result.contenu().stream().map(FichierDto::from).toList(),
                result.page(),
                result.size(),
                result.totalElements(),
                result.totalPages()
        );
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/partages-avec-moi")
    @Operation(summary = "Lister les fichiers partages avec moi")
    public ResponseEntity<List<FichierDto>> listerPartagesAvecMoi(
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        List<FichierDto> fichiers = listerUseCase.listerFichiersPartagesAvecMoi(userId)
                .stream()
                .map(FichierDto::from)
                .toList();
        return ResponseEntity.ok(fichiers);
    }

    @GetMapping("/{id}/telecharger")
    @Operation(summary = "Telecharger un fichier")
    public ResponseEntity<Resource> telecharger(
            @PathVariable UUID id,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        FichierContenu contenu = telechargerUseCase.telecharger(new TelechargerCommand(id, userId));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contenu.typeMime()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + contenu.nom() + "\"")
                .body(new InputStreamResource(contenu.contenu()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un fichier")
    public ResponseEntity<Void> supprimer(
            @PathVariable UUID id,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        supprimerUseCase.supprimer(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/renommer")
    @Operation(summary = "Renommer un fichier")
    public ResponseEntity<FichierDto> renommer(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        String nouveauNom = body.get("nom");
        Fichier fichier = renommerUseCase.renommer(id, userDetails.getId(), nouveauNom);
        return ResponseEntity.ok(FichierDto.from(fichier));
    }

    @GetMapping("/quota")
    @Operation(summary = "Consulter le quota de stockage")
    public ResponseEntity<Map<String, Long>> quota(
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        long utilise = fichierRepository.calculerEspaceUtilise(userDetails.getId());
        long max = 100L * 1024 * 1024;
        return ResponseEntity.ok(Map.of(
                "utilise", utilise,
                "maximum", max,
                "disponible", max - utilise
        ));
    }

    @GetMapping("/activites")
    @Operation(summary = "Consulter l'historique d'activite")
    public ResponseEntity<List<ActiviteLogDto>> activites(
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        List<ActiviteLog> logs = activiteLogRepository.findByUtilisateurIdOrderByCreatedAtDesc(
                userDetails.getId(), 50);
        List<ActiviteLogDto> dtos = logs.stream().map(ActiviteLogDto::from).toList();
        return ResponseEntity.ok(dtos);
    }
}
