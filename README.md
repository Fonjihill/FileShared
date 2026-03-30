# FileShared

Plateforme de partage de fichiers securisee, construite avec une architecture hexagonale.

## Stack technique

| Composant | Technologie |
|-----------|------------|
| Backend | Java 21, Spring Boot 4.0.3 |
| Base de donnees | PostgreSQL 16 |
| Frontend | Angular 16, PrimeNG 16 |
| Securite | Spring Security, JWT (access + refresh token) |
| Tests | JUnit 5, Mockito, AssertJ, MockMvc, H2 |
| Documentation API | Swagger / SpringDoc OpenAPI |

## Architecture hexagonale

Le projet suit une architecture **Ports & Adapters** stricte. Les dependances pointent toujours vers le domaine.

```
src/main/java/com/bomunto/fileshared/
├── domaine/                          # Le coeur metier (zero dependance externe)
│   ├── common/                       #   EntityAbstract
│   ├── identity/                     #   Utilisateur, Role
│   │   ├── exception/                #   EmailDejaUtiliseException, IdentifiantsInvalidesException
│   │   └── port/
│   │       ├── in/                   #   RegisterUseCase, LoginUseCase, Commands, Results
│   │       └── out/                  #   UtilisateurRepository, PasswordHasher, TokenProvider
│   └── filesharing/                  #   Fichier, LienPartage, PartageUtilisateur
│       ├── exception/                #   FichierIntrouvableException, AccesRefuseException, LienExpireException
│       └── port/
│           ├── in/                   #   UploadFichierUseCase, ListerFichierUseCase, TelechargerFichierUseCase, SupprimerFichierUseCase
│           └── out/                  #   FichierRepository, FileStorage, LienPartageRepository
│
├── application/                      # Orchestration des use cases
│   ├── identity/service/             #   AuthServiceImpl (register, login)
│   └── filesharing/                  #   FichierServiceImpl (upload, lister, telecharger, supprimer)
│
└── infrastructure/                   # Adapters techniques
    ├── config/                       #   SecurityConfig, CorsConfig, AppConfig, OpenApiConfig
    ├── security/                     #   JwtAuthenticationFilter, BcryptPasswordAdapter, JwtTokenAdapter
    ├── storage/                      #   LocalFileStorageAdapter (implements FileStorage)
    ├── persistence/
    │   ├── identity/                 #   UtilisateurRepositoryAdapter, JPA entity, mapper
    │   └── filesharing/              #   FichierRepositoryAdapter, LienPartageRepositoryAdapter, JPA entities, mappers
    └── web/
        ├── common/                   #   GlobalExceptionHandler, ErrorResponse
        ├── identity/                 #   AuthController, DTOs (RegisterRequest, LoginRequest, AuthResponse), AuthWebMapper
        └── filesharing/              #   FichierController, PartageController, DTOs, FichierWebMapper
```

### Flux d'une requete (exemple : upload de fichier)

```
Client HTTP
  → FichierController (infrastructure/web)
    → FichierWebMapper : MultipartFile → UploadFichierCommand
      → UploadFichierUseCase (port IN — interface du domaine)
        → FichierServiceImpl (application — implemente le use case)
          → FileStorage.stocker() (port OUT → LocalFileStorageAdapter)
          → FichierRepository.save() (port OUT → FichierRepositoryAdapter → JPA)
        ← FichierResult
      ← FichierDto.from()
    ← ResponseEntity<FichierDto> (JSON)
  ← 201 Created
```

## API REST

### Authentification

| Methode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/auth/register` | Inscription | Non |
| POST | `/auth/login` | Connexion (retourne JWT) | Non |

### Fichiers

| Methode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/fichiers` | Upload un fichier (multipart) | Oui (JWT) |
| GET | `/fichiers` | Lister mes fichiers | Oui (JWT) |
| GET | `/fichiers/{id}/telecharger` | Telecharger un fichier | Oui (JWT) |
| DELETE | `/fichiers/{id}` | Supprimer un fichier (soft delete) | Oui (JWT) |

### Partage

| Methode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/fichiers/{id}/partager/lien` | Creer un lien de partage | Oui (JWT) |
| POST | `/fichiers/{id}/partager/utilisateur` | Partager avec un utilisateur | Oui (JWT) |
| GET | `/partages/{token}` | Telecharger via lien public | Non |
| DELETE | `/partages/{id}` | Revoquer un partage | Oui (JWT) |

**Base URL :** `http://localhost:8081/api/v1`

**Swagger UI :** `http://localhost:8081/api/v1/docs/swagger`

## Frontend Angular

```
frontend/src/app/
├── auth/
│   ├── models/
│   │   └── auth.models.ts            # Interfaces TypeScript (miroir des DTOs Java)
│   ├── services/
│   │   └── auth.service.ts           # Appels HTTP register/login, gestion tokens localStorage
│   └── pages/
│       ├── login/                    # Page de connexion (formulaire reactif + PrimeNG)
│       └── register/                 # Page d'inscription (formulaire reactif + PrimeNG)
├── dashboard/
│   └── dashboard.component.ts        # Page apres connexion
├── shared/
│   ├── interceptors/
│   │   └── jwt.interceptor.ts        # Ajoute Authorization: Bearer token a chaque requete
│   └── guards/
│       └── auth.guard.ts             # Protege /dashboard — redirige vers /login si non connecte
├── app.module.ts                     # Module racine (HttpClient, ReactiveFormsModule, PrimeNG)
├── app-routing.module.ts             # Routes : /login, /register, /dashboard (guard)
└── app.component.html                # <router-outlet> uniquement
```

### Navigation

```
/ → redirige vers /login
/login → page de connexion
/register → page d'inscription
/dashboard → page protegee (AuthGuard verifie le token)
/** → redirige vers /login (404)
```

## Tests

34 tests au total, tous passent.

| Couche | Classe de test | Nb tests | Type |
|--------|---------------|----------|------|
| Domaine | FichierTest | 5 | Unitaire (Java pur) |
| Domaine | LienPartageTest | 7 | Unitaire (Java pur) |
| Application | FichierServiceImplTest | 12 | Unitaire (Mockito) |
| Application | AuthServiceImplTest | 5 | Unitaire (Mockito) |
| Integration | AuthControllerIntegrationTest | 5 | Integration (MockMvc + H2) |

```bash
# Lancer tous les tests
./mvnw test

# Lancer un test specifique
./mvnw test -Dtest=AuthServiceImplTest
```

## Lancer le projet

### Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL 16 (ou Docker)

### Backend

```bash
# Demarrer PostgreSQL (Docker)
docker run -d --name fileshared-db \
  -e POSTGRES_DB=fileshared_db \
  -e POSTGRES_USER=fileshared \
  -e POSTGRES_PASSWORD=fileshared_secret \
  -p 5434:5432 postgres:16

# Lancer le backend
./mvnw spring-boot:run
# Disponible sur http://localhost:8081/api/v1
```

### Frontend

```bash
cd frontend
npm install
ng serve
# Disponible sur http://localhost:4200
```

## Configuration

### Backend (application.yml)

| Propriete | Valeur | Description |
|-----------|--------|-------------|
| `server.port` | 8081 | Port du serveur |
| `server.servlet.context-path` | /api/v1 | Prefixe de toutes les URLs |
| `app.jwt.secret` | ... | Cle de signature JWT |
| `app.jwt.expiration-ms` | 86400000 | Duree du token (24h) |
| `app.jwt.refresh-expiration-ms` | 604800000 | Duree du refresh token (7j) |
| `app.cors.allowed-origins` | localhost:3000,3001,4200 | Origins CORS autorises |

### Profils

- **default** : PostgreSQL (production/dev)
- **test** : H2 en memoire (tests d'integration)

## Securite

- Authentification **JWT stateless** (pas de session serveur)
- Mots de passe hashes avec **BCrypt**
- **Refresh tokens** pour renouveler l'acces sans re-login
- CORS configure pour les origins autorises
- Endpoints `/auth/**` publics, tout le reste authentifie
- Soft delete sur les fichiers (pas de suppression physique)

