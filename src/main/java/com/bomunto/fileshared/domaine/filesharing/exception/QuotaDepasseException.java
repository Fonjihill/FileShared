package com.bomunto.fileshared.domaine.filesharing.exception;

public class QuotaDepasseException extends RuntimeException {
    public QuotaDepasseException() {
        super("Quota de stockage depasse. Maximum : 100 Mo");
    }
}
