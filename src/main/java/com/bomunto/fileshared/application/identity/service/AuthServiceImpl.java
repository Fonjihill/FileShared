package com.bomunto.fileshared.application.identity.service;

import com.bomunto.fileshared.domaine.identity.Role;
import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.domaine.identity.exception.EmailDejaUtiliseException;
import com.bomunto.fileshared.domaine.identity.exception.IdentifiantsInvalidesException;
import com.bomunto.fileshared.domaine.identity.port.in.*;
import com.bomunto.fileshared.domaine.identity.port.out.PasswordHasher;
import com.bomunto.fileshared.domaine.identity.port.out.TokenProvider;
import com.bomunto.fileshared.domaine.identity.port.out.UtilisateurRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class AuthServiceImpl implements RegisterUseCase, LoginUseCase {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordHasher passwordHasher;
    private final TokenProvider tokenProvider;

    public AuthServiceImpl(UtilisateurRepository utilisateurRepository, PasswordHasher passwordHasher, TokenProvider tokenProvider) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordHasher = passwordHasher;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public RegisterResult register(RegisterCommand command) {
        if(utilisateurRepository.existsByEmail(command.email()))
            throw new EmailDejaUtiliseException("L'email " + command.email() + " est déjà utilisé");

        Utilisateur utilisateur = new Utilisateur(
                null, command.username(), command.email(),
                passwordHasher.hash(command.motDePasse()),
                Role.USER, Instant.now(), Instant.now());

       Utilisateur saved = utilisateurRepository.save(utilisateur);
        return new RegisterResult(saved);
    }


    @Override
    public AuthResult login(LoginCommand command) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(command.email())
                .orElseThrow(IdentifiantsInvalidesException::new);

        if(!passwordHasher.matches(command.motDePasse(), utilisateur.getPasswordHash()))
            throw new IdentifiantsInvalidesException();

        return new AuthResult(
                tokenProvider.generateToken(utilisateur),
                tokenProvider.generateRefreshToken(utilisateur)
        );
    }
}
