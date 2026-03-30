package com.bomunto.fileshared.infrastructure.web.filesharing.controller;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;
import com.bomunto.fileshared.domaine.filesharing.port.in.*;
import com.bomunto.fileshared.infrastructure.security.DtfUserDetails;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.CreerLienRequest;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.LienPartageDto;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.PartagerRequest;
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

import java.util.UUID;

@RestController
@Tag(name = "Partage", description = "Partage de fichiers par lien ou avec un utilisateur")
public class PartageController {

    private final PartagerFichierUseCase partagerUseCase;
    private final TelechargerFichierUseCase telechargerUseCase;

    public PartageController(PartagerFichierUseCase partagerUseCase,
                             TelechargerFichierUseCase telechargerUseCase) {
        this.partagerUseCase = partagerUseCase;
        this.telechargerUseCase = telechargerUseCase;
    }

    @PostMapping("/fichiers/{fichierId}/partager/lien")
    @Operation(summary = "Créer un lien de partage pour un fichier")
    public ResponseEntity<LienPartageDto> creerLien(
            @PathVariable UUID fichierId,
            @Valid @RequestBody CreerLienRequest request,
            @AuthenticationPrincipal DtfUserDetails userDetails) {

        UUID userId = userDetails.getId();
        CreerLienCommand command = new CreerLienCommand(
                fichierId, userId, request.permission(), request.expiration()
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
