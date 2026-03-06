package com.bomunto.fileshared.infrastructure.storage.adapter;

import com.bomunto.fileshared.domaine.filesharing.port.out.FileStorage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalFileStorageAdapter implements FileStorage {

    private final Path racine;

    public LocalFileStorageAdapter(@Value("${fileshared.storage.local.path:./uploads}") String chemin) {
        this.racine = Path.of(chemin);
        try {
            Files.createDirectories(racine);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de creer le repertoire de stockage : " + chemin, e);
        }
    }

    @Override
    public String stocker(String nom, InputStream contenu) {
        String nomUnique = UUID.randomUUID() + "_" + nom;
        Path destination = racine.resolve(nomUnique);
        try {
            Files.copy(contenu, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage du fichier : " + nom, e);
        }
        return nomUnique;
    }

    @Override
    public InputStream recuperer(String chemin) {
        try {
            return Files.newInputStream(racine.resolve(chemin));
        } catch (IOException e) {
            throw new RuntimeException("Fichier introuvable : " + chemin, e);
        }
    }

    @Override
    public void supprimer(String chemin) {
        try {
            Files.deleteIfExists(racine.resolve(chemin));
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier : " + chemin, e);
        }
    }
}
