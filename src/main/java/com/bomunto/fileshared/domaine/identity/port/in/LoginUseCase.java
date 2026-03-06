package com.bomunto.fileshared.domaine.identity.port.in;

public interface LoginUseCase {
    AuthResult login(LoginCommand command);
}
