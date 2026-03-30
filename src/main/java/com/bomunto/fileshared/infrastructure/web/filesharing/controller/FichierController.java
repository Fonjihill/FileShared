package com.bomunto.fileshared.infrastructure.web.filesharing.controller;

import com.bomunto.fileshared.domaine.filesharing.port.in.*;
import com.bomunto.fileshared.infrastructure.security.DtfUserDetails;
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
import java.util.UUID;

@RestController
@RequestMapping("/fichiers")
@Tag(name = "Fichiers", description = "Upload, téléchargement, liste et suppression de fichiers")
public class FichierController {

    private final UploadFichierUseCase uploadUseCase;
    private final ListerFichierUseCase listerUseCase;
    private final TelechargerFichierUseCase telechargerUseCase;
    private final SupprimerFichierUseCase supprimerUseCase;

    public FichierController(UploadFichierUseCase uploadUseCase,
                             ListerFichierUseCase listerUseCase,
                             TelechargerFichierUseCase telechargerUseCase,
                             SupprimerFichierUseCase supprimerUseCase) {
        this.uploadUseCase = uploadUseCase;
        this.listerUseCase = listerUseCase;
        this.telechargerUseCase = telechargerUseCase;
        this.supprimerUseCase = supprimerUseCase;
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
    @Operation(summary = "Lister mes fichiers")
    public ResponseEntity<List<FichierDto>> lister(
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        List<FichierDto> fichiers = listerUseCase.listerFichiers(userId)
                .stream()
                .map(FichierDto::from)
                .toList();
        return ResponseEntity.ok(fichiers);
    }

    @GetMapping("/{id}/telecharger")
    @Operation(summary = "Télécharger un fichier")
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
}
