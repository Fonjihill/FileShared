package com.bomunto.fileshared.infrastructure.email.adapter;

import com.bomunto.fileshared.domaine.identity.port.out.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MockEmailAdapter implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(MockEmailAdapter.class);

    @Override
    public void envoyerNotificationPartage(String email, String nomFichier, String nomProprietaire) {
        log.info("EMAIL [mock] -> {} : {} vous a partage le fichier '{}'", email, nomProprietaire, nomFichier);
    }
}
