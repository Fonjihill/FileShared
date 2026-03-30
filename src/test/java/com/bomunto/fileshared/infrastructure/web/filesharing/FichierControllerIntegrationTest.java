package com.bomunto.fileshared.infrastructure.web.filesharing;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FichierControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        // Utiliser un UUID comme username car le controller fait UUID.fromString(userDetails.getUsername())
        String uniqueId = UUID.randomUUID().toString();
        String email = "fichier-" + uniqueId.substring(0, 8) + "@test.com";
        String username = UUID.randomUUID().toString();

        // Enregistrer un utilisateur
        mockMvc.perform(
                post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "%s",
                                    "email": "%s",
                                    "motDePasse": "Password123"
                                }
                                """.formatted(username, email))
        ).andExpect(status().isCreated());

        // Se connecter pour obtenir le token
        MvcResult loginResult = mockMvc.perform(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "%s",
                                    "motDePasse": "Password123"
                                }
                                """.formatted(email))
        )
                .andExpect(status().isOk())
                .andReturn();

        token = JsonPath.read(loginResult.getResponse().getContentAsString(), "$.token");
    }

    // ================================================================
    // Upload
    // ================================================================

    @Test
    @DisplayName("POST /fichiers - fichier valide avec JWT retourne 201")
    void upload_fichierValide_retourne201() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "fichier", "test-upload.txt", "text/plain", "contenu du fichier".getBytes());

        mockMvc.perform(
                multipart("/fichiers")
                        .file(file)
                        .header("Authorization", "Bearer " + token)
        )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("test-upload.txt"))
                .andExpect(jsonPath("$.typeMime").value("text/plain"))
                .andExpect(jsonPath("$.statut").value("ACTIF"));
    }

    // ================================================================
    // Lister
    // ================================================================

    @Test
    @DisplayName("GET /fichiers - avec token retourne 200 et une liste")
    void lister_avecToken_retourne200() throws Exception {
        // D'abord uploader un fichier
        MockMultipartFile file = new MockMultipartFile(
                "fichier", "test-list.txt", "text/plain", "contenu".getBytes());

        mockMvc.perform(
                multipart("/fichiers")
                        .file(file)
                        .header("Authorization", "Bearer " + token)
        ).andExpect(status().isCreated());

        // Lister les fichiers
        mockMvc.perform(
                get("/fichiers")
                        .header("Authorization", "Bearer " + token)
        )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ================================================================
    // Supprimer
    // ================================================================

    @Test
    @DisplayName("DELETE /fichiers/{id} - fichier existant avec JWT retourne 204")
    void supprimer_fichierExistant_retourne204() throws Exception {
        // D'abord uploader un fichier
        MockMultipartFile file = new MockMultipartFile(
                "fichier", "test-delete.txt", "text/plain", "contenu".getBytes());

        MvcResult uploadResult = mockMvc.perform(
                multipart("/fichiers")
                        .file(file)
                        .header("Authorization", "Bearer " + token)
        )
                .andExpect(status().isCreated())
                .andReturn();

        String fichierId = JsonPath.read(uploadResult.getResponse().getContentAsString(), "$.id");

        // Supprimer le fichier
        mockMvc.perform(
                delete("/fichiers/" + fichierId)
                        .header("Authorization", "Bearer " + token)
        )
                .andExpect(status().isNoContent());
    }

    // ================================================================
    // Sans authentification
    // ================================================================

    @Test
    @DisplayName("POST /fichiers - sans token retourne 401 ou 403")
    void upload_sansToken_retourne401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "fichier", "test-noauth.txt", "text/plain", "contenu".getBytes());

        mockMvc.perform(
                multipart("/fichiers")
                        .file(file)
        )
                .andExpect(status().isForbidden());
    }
}
