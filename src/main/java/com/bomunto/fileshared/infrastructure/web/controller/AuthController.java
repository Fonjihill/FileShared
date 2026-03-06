package com.bomunto.fileshared.infrastructure.web.controller;


import com.bomunto.fileshared.domaine.identity.port.in.*;
import com.bomunto.fileshared.infrastructure.web.dto.AuthResponse;
import com.bomunto.fileshared.infrastructure.web.dto.LoginRequest;
import com.bomunto.fileshared.infrastructure.web.dto.RegisterRequest;
import com.bomunto.fileshared.infrastructure.web.dto.RegisterResponse;
import com.bomunto.fileshared.infrastructure.web.mapper.AuthWebMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentification", description = "Inscription, connexion, rafraichissement de token et deconnexion")
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;

    @Autowired
    public AuthController(RegisterUseCase registerUseCase, LoginUseCase loginUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        RegisterCommand command = AuthWebMapper.toRegisterCommand(request);
        RegisterResult result = registerUseCase.register(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthWebMapper.toRegisterResponse(result));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {
        var result = loginUseCase.login(AuthWebMapper.toLoginCommand(request));
        return ResponseEntity.ok(AuthWebMapper.toLoginResponse(result));
    }
}
