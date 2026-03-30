package com.bomunto.fileshared.infrastructure.web.filesharing.mapper;

import com.bomunto.fileshared.domaine.filesharing.port.in.FichierResult;
import com.bomunto.fileshared.domaine.filesharing.port.in.UploadFichierCommand;
import com.bomunto.fileshared.infrastructure.web.filesharing.dto.FichierDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public final class FichierWebMapper {

    private FichierWebMapper() {}

    public static FichierDto fichierDto(FichierResult result) {
        return FichierDto.from(result.fichier());
    }

    public static UploadFichierCommand toUploadCommand(MultipartFile fichier, UUID proprietaireId) throws Exception {
        return new UploadFichierCommand(
                fichier.getOriginalFilename(),
                fichier.getContentType(),
                fichier.getSize(),
                fichier.getInputStream(),
                proprietaireId
        );
    }
}
