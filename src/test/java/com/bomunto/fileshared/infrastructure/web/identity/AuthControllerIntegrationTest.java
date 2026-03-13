package com.bomunto.fileshared.infrastructure.web.identity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest                   // Demarre TOUTE l'application Spring
@AutoConfigureMockMvc             // Configure MockMvc pour simuler des requetes HTTP
@ActiveProfiles("test")           // Utilise application-test.yml (H2 au lieu de PostgreSQL)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;      // Le client HTTP de test

    // ================================================================
    // Register
    // ================================================================

    @Test
    @DisplayName("POST /auth/register - utilisateur valide retourne 201")
    void register_utilisateurValide_retourne201() throws Exception {
        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "john",
                                    "email": "john@test.com",
                                    "motDePasse": "Password123"
                                }
                                """)
        )
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.utilisateur.email").value("john@test.com"))
        .andExpect(jsonPath("$.utilisateur.username").value("john"));
    }

    @Test
    @DisplayName("POST /auth/register - email invalide retourne 400")
    void register_emailInvalide_retourne400() throws Exception {
        // Meme structure mais avec un email invalide : "pas-un-email"
        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "john",
                                    "email": "pas-un-email",
                                    "motDePasse": "Password123"
                                }
                                """)
        )
    .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/register - mot de passe trop court retourne 400")
    void register_motDePasseTropCourt_retourne400() throws Exception {
        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "john",
                                    "email": "john3@test.com",
                                    "motDePasse": "abc"
                                }
                                """)
        )
        .andExpect(status().isBadRequest());
    }

    // ================================================================
    // Login
    // ================================================================

    @Test
    @DisplayName("POST /auth/login - credentials valides retourne 200 avec tokens")
    void login_credentialsValides_retourne200AvecTokens() throws Exception {
        // Etape 1 : D'abord enregistrer un utilisateur (copie le perform du register)
        // Etape 2 : Ensuite faire le login avec les memes credentials :
        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "login",
                                    "email": "login@test.com",
                                    "motDePasse": "Password123"
                                }
                                """)
        )
        .andExpect(status().isCreated());

        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "login@test.com",
                                    "motDePasse": "Password123"
                                }
                                """)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isNotEmpty())
        .andExpect(jsonPath("$.refreshToken").isNotEmpty());
    }

    @Test
    @DisplayName("POST /auth/login - mauvais mot de passe retourne 401")
    void login_mauvaisMotDePasse_retourne401() throws Exception {
        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "badpass",
                                    "email": "badpass@test.com",
                                    "motDePasse": "Password123"
                                }
                                """)
        )
        .andExpect(status().isCreated());

        mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "badpass@test.com",
                                    "motDePasse": "MauvaisMotDePasse"
                                }
                                """)
        )
        .andExpect(status().isUnauthorized());
    }
}
