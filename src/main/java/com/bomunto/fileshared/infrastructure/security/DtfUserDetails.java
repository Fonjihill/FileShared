package com.bomunto.fileshared.infrastructure.security;

import com.bomunto.fileshared.infrastructure.persistence.entity.UtilisateurJpaEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class DtfUserDetails implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final String username;
    private final String role;
    private final Collection<? extends GrantedAuthority> authorities;

    public DtfUserDetails(UtilisateurJpaEntity entity) {
        this.id = entity.getId();
        this.email = entity.getEmail();
        this.password = entity.getPasswordHash();
        this.username = entity.getUsername();
        this.role = entity.getRole().name();
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + entity.getRole().name()));
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
