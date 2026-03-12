package com.bomunto.fileshared.infrastructure.web.identity.mapper;

import com.bomunto.fileshared.domaine.identity.port.in.AuthResult;
import com.bomunto.fileshared.domaine.identity.port.in.LoginCommand;
import com.bomunto.fileshared.domaine.identity.port.in.RegisterCommand;
import com.bomunto.fileshared.domaine.identity.port.in.RegisterResult;
import com.bomunto.fileshared.infrastructure.web.identity.dto.*;

public final class AuthWebMapper {

    // Constructeur privé pour empêcher l'instanciation de la classe
    private AuthWebMapper() {}

    public static RegisterCommand toRegisterCommand(RegisterRequest req) {
        return new RegisterCommand(
                req.email(), req.username(), req.motDePasse());
    }

    public static LoginCommand toLoginCommand(LoginRequest request) {
        return new LoginCommand(request.email(), request.motDePasse());
    }

    public static AuthResponse toLoginResponse(AuthResult result) {
        return new AuthResponse(
                result.token(),
                result.refreshToken()// Les informations de l'utilisateur seront ajoutées dans le service d'authentification
        );
    }

    public static RegisterResponse toRegisterResponse(RegisterResult result) {
        return new RegisterResponse(
                UtilisateurDto.from(result.utilisateur())
        );
    }
}
