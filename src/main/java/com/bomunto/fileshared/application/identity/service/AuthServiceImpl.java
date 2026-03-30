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
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthServiceImpl implements RegisterUseCase, LoginUseCase, RefreshTokenUseCase, GetProfilUseCase, RechercherUtilisateurUseCase {
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

    @Override
    public AuthResult refresh(String refreshToken) {
        // 1. Extraire l'email du refresh token
        String email = tokenProvider.extractUsername(refreshToken);

        // 2. Vérifier que le token est valide
        if (!tokenProvider.isTokenValid(refreshToken, email)) {
            throw new IdentifiantsInvalidesException();
        }

        // 3. Récupérer l'utilisateur
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(IdentifiantsInvalidesException::new);

        // 4. Générer de nouveaux tokens
        return new AuthResult(
                tokenProvider.generateToken(utilisateur),
                tokenProvider.generateRefreshToken(utilisateur)
        );
    }

    @Override
    public Utilisateur getProfil(UUID utilisateurId) {
        return utilisateurRepository.findById(utilisateurId)
                .orElseThrow(IdentifiantsInvalidesException::new);
    }

    @Override
    public Optional<Utilisateur> rechercherParEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }
}
