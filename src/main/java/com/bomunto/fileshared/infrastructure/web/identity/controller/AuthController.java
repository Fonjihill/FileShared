package com.bomunto.fileshared.infrastructure.web.identity.controller;

import com.bomunto.fileshared.domaine.identity.Utilisateur;
import com.bomunto.fileshared.domaine.identity.port.in.*;
import com.bomunto.fileshared.infrastructure.security.DtfUserDetails;
import com.bomunto.fileshared.infrastructure.web.identity.dto.*;
import com.bomunto.fileshared.infrastructure.web.identity.mapper.AuthWebMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentification", description = "Inscription, connexion, rafraichissement de token et deconnexion")
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final GetProfilUseCase getProfilUseCase;
    private final RechercherUtilisateurUseCase rechercherUtilisateurUseCase;

    public AuthController(RegisterUseCase registerUseCase,
                          LoginUseCase loginUseCase,
                          RefreshTokenUseCase refreshTokenUseCase,
                          GetProfilUseCase getProfilUseCase,
                          RechercherUtilisateurUseCase rechercherUtilisateurUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.getProfilUseCase = getProfilUseCase;
        this.rechercherUtilisateurUseCase = rechercherUtilisateurUseCase;
    }

    // ────────────────────────────────────────────
    // 1. INSCRIPTION — POST /auth/register
    // ────────────────────────────────────────────
    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        RegisterCommand command = AuthWebMapper.toRegisterCommand(request);
        RegisterResult result = registerUseCase.register(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthWebMapper.toRegisterResponse(result));
    }

    // ────────────────────────────────────────────
    // 2. CONNEXION — POST /auth/login
    // ────────────────────────────────────────────
    @PostMapping("/login")
    @Operation(summary = "Connexion d'un utilisateur")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        var result = loginUseCase.login(AuthWebMapper.toLoginCommand(request));
        return ResponseEntity.ok(AuthWebMapper.toLoginResponse(result));
    }

    // ────────────────────────────────────────────
    // 3. REFRESH TOKEN — POST /auth/refresh
    // ────────────────────────────────────────────
    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchir le token d'accès")
    public ResponseEntity<AuthResponse> refresh(
            @Valid @RequestBody RefreshRequest request) {
        AuthResult result = refreshTokenUseCase.refresh(request.refreshToken());
        return ResponseEntity.ok(new AuthResponse(result.token(), result.refreshToken()));
    }

    // ────────────────────────────────────────────
    // 4. PROFIL — GET /auth/me
    // ────────────────────────────────────────────
    @GetMapping("/me")
    @Operation(summary = "Récupérer le profil de l'utilisateur connecté")
    public ResponseEntity<UtilisateurDto> me(
            @AuthenticationPrincipal DtfUserDetails userDetails) {
        UUID userId = userDetails.getId();
        Utilisateur utilisateur = getProfilUseCase.getProfil(userId);
        return ResponseEntity.ok(UtilisateurDto.from(utilisateur));
    }

    // ────────────────────────────────────────────
    // 5. DECONNEXION — POST /auth/logout
    // ────────────────────────────────────────────
    @PostMapping("/logout")
    @Operation(summary = "Déconnexion (côté client, supprime les tokens)")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    // ────────────────────────────────────────────
    // 6. RECHERCHE PAR EMAIL — GET /auth/users/search?email=xxx
    // ────────────────────────────────────────────
    @GetMapping("/users/search")
    @Operation(summary = "Chercher un utilisateur par email")
    public ResponseEntity<UtilisateurDto> searchByEmail(@RequestParam String email) {
        return rechercherUtilisateurUseCase.rechercherParEmail(email)
                .map(u -> ResponseEntity.ok(UtilisateurDto.from(u)))
                .orElse(ResponseEntity.notFound().build());
    }
}
