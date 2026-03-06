package com.bomunto.fileshared.infrastructure.config;

import com.bomunto.fileshared.domaine.identity.Role;
import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.domaine.identity.port.out.PasswordHasher;
import com.bomunto.fileshared.domaine.identity.port.out.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordHasher passwordHasher;

    public DataInitializer(UtilisateurRepository utilisateurRepository, PasswordHasher passwordHasher) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordHasher = passwordHasher;
    }

    @Override
    public void run(String... args) {
        if (utilisateurRepository.count() > 0) {
            log.info("Comptes utilisateurs deja presents, seed ignore.");
            return;
        }

        log.info("Creation des comptes de test...");

        Utilisateur admin = new Utilisateur(
                null,
                "admin",
                "admin@bomunto.com",
                passwordHasher.hash("adminpass"),
                Role.ADMIN,
                Instant.now(),
                Instant.now()
        );
        utilisateurRepository.save(admin);
        log.info("  -> admin@bomunto.com (ADMIN) cree");
    }
}
