package com.bomunto.fileshared.domaine.identity.port.in;

public interface RegisterUseCase {
    RegisterResult register(RegisterCommand command);
}
