package com.bomunto.fileshared.domaine.filesharing;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LienPartageTest {

    private LienPartage creerLien(Instant expiration, boolean actif) {
        return new LienPartage(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "token-abc-123",
                Permission.LECTURE,
                expiration,
                actif,
                UUID.randomUUID(),
                Instant.now(),
                Instant.now()
        );
    }

    // ===== estExpire() =====

    @Test
    @DisplayName("Un lien avec expiration dans le futur n'est pas expire")
    void lienExpirationFuture_estExpire_retourneFalse() {
        LienPartage lien = creerLien(Instant.now().plus(1, ChronoUnit.HOURS), true);
        assertThat(lien.estExpire()).isFalse();
    }

    @Test
    @DisplayName("Un lien avec expiration dans le passe est expire")
    void lienExpirationPassee_estExpire_retourneTrue() {
        LienPartage lien = creerLien(Instant.now().minus(1, ChronoUnit.HOURS), true);
        assertThat(lien.estExpire()).isTrue();
    }

    @Test
    @DisplayName("Un lien sans date d'expiration (null) n'est jamais expire")
    void lienSansExpiration_estExpire_retourneFalse() {
        LienPartage lien = creerLien(null, true);
        assertThat(lien.estExpire()).isFalse();
    }

    // ===== estValide() =====

    @Test
    @DisplayName("Un lien actif et non expire est valide")
    void lienActifNonExpire_estValide_retourneTrue() {
        LienPartage lien = creerLien(Instant.now().plus(1, ChronoUnit.HOURS), true);
        assertThat(lien.estValide()).isTrue();
    }

    @Test
    @DisplayName("Un lien actif mais expire n'est pas valide")
    void lienActifMaisExpire_estValide_retourneFalse() {
        LienPartage lien = creerLien(Instant.now().minus(1, ChronoUnit.HOURS), true);
        assertThat(lien.estValide()).isFalse();
    }

    @Test
    @DisplayName("Un lien inactif meme non expire n'est pas valide")
    void lienInactifNonExpire_estValide_retourneFalse() {
        LienPartage lien = creerLien(Instant.now().plus(1, ChronoUnit.HOURS), false);
        assertThat(lien.estValide()).isFalse();
    }

    // ===== desactiver() =====

    @Test
    @DisplayName("desactiver() doit rendre le lien inactif et donc invalide")
    void desactiver_lienActif_devientInactif() {
        LienPartage lien = creerLien(Instant.now().plus(1, ChronoUnit.HOURS), true);
        lien.desactiver();
        assertThat(lien.isActif()).isFalse();
        assertThat(lien.estValide()).isFalse();
    }
}
