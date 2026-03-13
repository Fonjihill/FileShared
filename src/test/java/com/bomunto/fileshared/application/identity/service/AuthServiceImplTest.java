package com.bomunto.fileshared.application.identity.service;

import com.bomunto.fileshared.domaine.identity.Role;
import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.domaine.identity.exception.EmailDejaUtiliseException;
import com.bomunto.fileshared.domaine.identity.exception.IdentifiantsInvalidesException;
import com.bomunto.fileshared.domaine.identity.port.in.AuthResult;
import com.bomunto.fileshared.domaine.identity.port.in.LoginCommand;
import com.bomunto.fileshared.domaine.identity.port.in.RegisterCommand;
import com.bomunto.fileshared.domaine.identity.port.in.RegisterResult;
import com.bomunto.fileshared.domaine.identity.port.out.PasswordHasher;
import com.bomunto.fileshared.domaine.identity.port.out.TokenProvider;
import com.bomunto.fileshared.domaine.identity.port.out.UtilisateurRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private TokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    // ================================================================
    // register()
    // ================================================================

    @Test
    @DisplayName("register - utilisateur valide cree le compte et retourne RegisterResult")
    void register_utilisateurValide_retourneRegisterResult() {
        RegisterCommand command = new RegisterCommand("john@example.com", "john1", "Password123");

        when(utilisateurRepository.existsByEmail(command.email())).thenReturn(false);
        when(passwordHasher.hash(command.motDePasse())).thenReturn("hashed-password");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenAnswer(i -> i.getArgument(0));

        RegisterResult result = authService.register(command);

        assertThat(result).isNotNull();
        assertThat(result.utilisateur().getEmail()).isEqualTo(command.email());
        assertThat(result.utilisateur().getRole()).isEqualTo(Role.USER);
        verify(passwordHasher).hash(command.motDePasse());
        verify(utilisateurRepository).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("register - email deja utilise leve EmailDejaUtiliseException")
    void register_emailExistant_leveException() {
        RegisterCommand command = new RegisterCommand("john@example.com", "john1", "Password123");
        when(utilisateurRepository.existsByEmail(command.email())).thenReturn(true);
        assertThatThrownBy(() -> authService.register(command))
                .isInstanceOf(EmailDejaUtiliseException.class)
                .hasMessageContaining("L'email " + command.email() + " est déjà utilisé");
    }

    // ================================================================
    // login()
    // ================================================================

    @Test
    @DisplayName("login - credentials valides retourne les tokens")
    void login_credentialsValides_retourneAuthResult() {
        Utilisateur utilisateur = new Utilisateur(
                UUID.randomUUID(), "john", "john@gmail.com", "hashed-password", Role.USER, null, null);
        LoginCommand command = new LoginCommand("john@gmail.com", "hashed-password");
        when(utilisateurRepository.findByEmail(command.email())).thenReturn(java.util.Optional.of(utilisateur));
        when(passwordHasher.matches(command.motDePasse(), utilisateur.getPasswordHash())).thenReturn(true);
        when(tokenProvider.generateToken(utilisateur)).thenReturn("jwt-token");
        when(tokenProvider.generateRefreshToken(utilisateur)).thenReturn("refresh-token");

        AuthResult result = authService.login(command);

        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
    }

    @Test
    @DisplayName("login - email inexistant lève IdentifiantsInvalidesException")
    void login_emailInexistant_leveException() {
        when(utilisateurRepository.findByEmail("john@gmail.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> authService.login(new LoginCommand("john@gmail.com", "any-password")))
                .isInstanceOf(IdentifiantsInvalidesException.class);
    }

    @Test
    @DisplayName("login - mauvais mot de passe lève IdentifiantsInvalidesException")
    void login_mauvaisMotDePasse_leveException() {

        Utilisateur utilisateur = new Utilisateur(
                UUID.randomUUID(), "john", "john@gmail.com", "hashed-password", Role.USER, null, null);
        when(utilisateurRepository.findByEmail("john@gmail.com")).thenReturn(Optional.of(utilisateur));
        when(passwordHasher.matches("mauvais", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginCommand("john@gmail.com", "mauvais")))
                .isInstanceOf(IdentifiantsInvalidesException.class);
    }
}
