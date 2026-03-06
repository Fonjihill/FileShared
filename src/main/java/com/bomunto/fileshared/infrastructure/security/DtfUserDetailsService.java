package com.bomunto.fileshared.infrastructure.security;

import com.bomunto.fileshared.infrastructure.persistence.identity.entity.UtilisateurJpaEntity;
import com.bomunto.fileshared.infrastructure.persistence.identity.jpa.JpaUtilisateurRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DtfUserDetailsService implements UserDetailsService {

    private final JpaUtilisateurRepository utilisateurRepository;

    public DtfUserDetailsService(JpaUtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UtilisateurJpaEntity entity = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouve : " + email));
        return new DtfUserDetails(entity);
    }
}
