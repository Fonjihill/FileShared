const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents
} = require("docx");

const COLORS = { primary: "1B4F72", secondary: "2E86C1", accent: "E74C3C", bg: "EBF5FB", bgCode: "F4F6F7", bgTip: "E8F8F5", bgWarn: "FEF9E7", dark: "2C3E50", gray: "7F8C8D", white: "FFFFFF" };
const border = { style: BorderStyle.SINGLE, size: 1, color: "D5D8DC" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const p = (t, opts = {}) => new Paragraph({ spacing: { after: 120 }, ...opts, children: Array.isArray(t) ? t : [new TextRun({ text: t, font: "Arial", size: 22, ...opts.run })] });
const bold = (t) => new TextRun({ text: t, bold: true, font: "Arial", size: 22 });
const normal = (t) => new TextRun({ text: t, font: "Arial", size: 22 });
const italic = (t) => new TextRun({ text: t, italics: true, font: "Arial", size: 22 });
const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] });

const question = (q) => new Paragraph({
  spacing: { before: 200, after: 60 },
  shading: { fill: COLORS.bg, type: ShadingType.CLEAR },
  indent: { left: 200, right: 200 },
  children: [new TextRun({ text: "Q : " + q, bold: true, font: "Arial", size: 22, color: COLORS.primary })],
});

const answer = (lines) => {
  const result = [];
  for (const line of lines) {
    result.push(new Paragraph({
      spacing: { after: 40 },
      indent: { left: 400 },
      children: [new TextRun({ text: line, font: "Arial", size: 21, color: COLORS.dark })],
    }));
  }
  result.push(spacer());
  return result;
};

const difficultyTag = (level) => {
  const colors = { "Facile": "27AE60", "Moyen": "E67E22", "Difficile": "E74C3C", "Expert": "8E44AD" };
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: `  [${level}]`, font: "Arial", size: 18, bold: true, color: colors[level] || COLORS.gray })],
  });
};

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { size: 56, bold: true, color: COLORS.primary, font: "Arial" }, paragraph: { spacing: { before: 600, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, color: COLORS.primary, font: "Arial" }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, color: COLORS.secondary, font: "Arial" }, paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: COLORS.dark, font: "Arial" }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ]},
  sections: [
    // COVER
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        spacer(), spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Questions d'Entretien Technique", font: "Arial", size: 56, bold: true, color: COLORS.primary })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Java | Spring Boot | JPA/Hibernate | Docker | Architecture", font: "Arial", size: 28, color: COLORS.secondary })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "120+ questions avec reponses detaillees", font: "Arial", size: 24, color: COLORS.gray })] }),
        spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Bomunto — Mars 2026", font: "Arial", size: 22, color: COLORS.gray })] }),
      ],
    },
    // CONTENT
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Questions d'Entretien Technique", font: "Arial", size: 18, color: COLORS.gray, italics: true })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: COLORS.gray }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: COLORS.gray }), new TextRun({ text: " / ", font: "Arial", size: 18, color: COLORS.gray }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: COLORS.gray })] })] }) },
      children: [
        h1("Table des matieres"),
        new TableOfContents("TOC", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════
        // JAVA CORE
        // ═══════════════════════════════════════════════════
        h1("1. Java Core"),

        h2("1.1 Les fondamentaux"),
        difficultyTag("Facile"),
        question("Quelle est la difference entre == et .equals() en Java ?"),
        ...answer([
          "== compare les references memoire (est-ce le meme objet en memoire ?).",
          ".equals() compare le contenu logique (est-ce que les valeurs sont identiques ?).",
          "Pour les String : \"abc\" == \"abc\" peut etre true (String pool), mais new String(\"abc\") == new String(\"abc\") est false.",
          "Toujours utiliser .equals() pour comparer des objets."
        ]),

        question("Quelle est la difference entre une interface et une classe abstraite ?"),
        ...answer([
          "Interface : contrat pur (que des signatures de methodes). Une classe peut implementer plusieurs interfaces. Depuis Java 8 : methodes default et static possibles.",
          "Classe abstraite : peut contenir du code (methodes concretes + abstraites), des champs, des constructeurs. Une classe ne peut heriter que d'une seule classe abstraite.",
          "Regle : utiliser une interface quand on veut definir un contrat (ex: nos ports TokenProvider, PasswordHasher). Utiliser une classe abstraite quand on veut partager du code (ex: EntityAbstract avec createdAt/updatedAt)."
        ]),

        question("Qu'est-ce qu'un record en Java ? Depuis quelle version ?"),
        ...answer([
          "Un record (depuis Java 16) est une classe immutable concise qui genere automatiquement : constructeur, getters, equals(), hashCode(), toString().",
          "Exemple : public record RegisterCommand(String email, String username, String motDePasse) {}",
          "Equivalent a une classe avec 3 champs final, un constructeur, 3 getters, equals/hashCode/toString.",
          "Ideal pour les DTOs, les commandes, les value objects."
        ]),

        difficultyTag("Moyen"),
        question("Expliquez la difference entre String, StringBuilder et StringBuffer."),
        ...answer([
          "String : immutable. Chaque modification cree un nouvel objet. Utilise le String pool.",
          "StringBuilder : mutable, non thread-safe, performant pour les concatenations en boucle.",
          "StringBuffer : mutable, thread-safe (synchronise), plus lent que StringBuilder.",
          "Regle : utiliser String pour les valeurs fixes, StringBuilder pour les constructions dynamiques (single-thread), StringBuffer jamais (utiliser StringBuilder + synchronisation externe si besoin)."
        ]),

        question("Qu'est-ce que le pattern Optional et pourquoi l'utiliser ?"),
        ...answer([
          "Optional<T> (Java 8+) represente une valeur qui peut etre presente ou absente.",
          "Remplace les retours null qui causent des NullPointerException.",
          "Exemple dans notre projet : Optional<Utilisateur> findByEmail(String email) — le port retourne Optional car l'utilisateur peut ne pas exister.",
          "Methodes cles : isPresent(), orElseThrow(), map(), flatMap().",
          "NE JAMAIS utiliser Optional comme parametre de methode ou champ de classe — uniquement en retour."
        ]),

        question("Quelle est la difference entre une checked et une unchecked exception ?"),
        ...answer([
          "Checked (herite de Exception) : DOIT etre geree (try/catch ou throws). Ex: IOException, SQLException.",
          "Unchecked (herite de RuntimeException) : pas obligatoire de la gerer. Ex: NullPointerException, IllegalArgumentException.",
          "Dans notre projet, EmailDejaUtiliseException herite de RuntimeException (unchecked) — c'est un choix DDD : les exceptions domaine sont unchecked car le domaine ne doit pas forcer l'infrastructure a gerer ses erreurs."
        ]),

        difficultyTag("Difficile"),
        question("Expliquez le fonctionnement du Garbage Collector en Java."),
        ...answer([
          "Le GC libere automatiquement la memoire des objets qui n'ont plus de references.",
          "La heap est divisee en generations : Young (Eden + Survivor) et Old.",
          "Les nouveaux objets vont dans Eden. Les survivants passent en Survivor, puis Old.",
          "Types de GC : Serial (petit heap), Parallel (throughput), G1 (equilibre, defaut depuis Java 9), ZGC (low-latency, Java 17+).",
          "On peut tuner : -Xms (heap initiale), -Xmx (heap max), -XX:+UseG1GC."
        ]),

        question("Qu'est-ce que le mot-cle volatile et quand l'utiliser ?"),
        ...answer([
          "volatile garantit la visibilite d'une variable entre threads : chaque lecture va directement en memoire principale, pas dans le cache du thread.",
          "NE garantit PAS l'atomicite : volatile int count; count++ n'est PAS thread-safe.",
          "Utiliser volatile pour : des flags boolean (stop = true), du double-checked locking (singleton).",
          "Pour l'atomicite, utiliser AtomicInteger, AtomicReference, ou synchronized."
        ]),

        question("Expliquez les Generics et le type erasure."),
        ...answer([
          "Les Generics permettent le typage parametrique : List<String>, Optional<Utilisateur>.",
          "Le type erasure : a la compilation, Java efface les types generiques. List<String> devient List a l'execution.",
          "Consequence : on ne peut pas faire new T(), instanceof List<String>, ou surcharger deux methodes qui different uniquement par le generique.",
          "Wildcards : ? extends T (lecture), ? super T (ecriture) — regle PECS (Producer Extends, Consumer Super)."
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════
        // SPRING BOOT
        // ═══════════════════════════════════════════════════
        h1("2. Spring Boot"),

        h2("2.1 Fondamentaux Spring"),
        difficultyTag("Facile"),
        question("Qu'est-ce que l'injection de dependances et pourquoi c'est important ?"),
        ...answer([
          "L'injection de dependances (DI) : au lieu de creer ses dependances (new Service()), un objet les recoit de l'exterieur (via le constructeur).",
          "Spring gere ca automatiquement : il cree les beans et les injecte ou ils sont necessaires.",
          "Avantage 1 : decouplage — la classe depend d'une interface, pas d'une implementation concrete.",
          "Avantage 2 : testabilite — on peut injecter des mocks pour les tests.",
          "Dans notre projet : AuthServiceImpl recoit UtilisateurRepository (interface), Spring injecte UtilisateurRepositoryAdapter (implementation)."
        ]),

        question("Quelle est la difference entre @Component, @Service, @Repository et @Controller ?"),
        ...answer([
          "Tous heritent de @Component et disent a Spring : 'cree un bean de cette classe'.",
          "@Component : generique.",
          "@Service : couche service/application (semantique, pas de magie supplementaire).",
          "@Repository : couche persistance. Spring ajoute la traduction des exceptions JPA.",
          "@Controller / @RestController : couche web. @RestController = @Controller + @ResponseBody.",
          "Dans notre projet : @Service sur AuthServiceImpl, @Component sur UtilisateurRepositoryAdapter, @RestController sur AuthController."
        ]),

        question("A quoi sert @Autowired ? Est-il obligatoire ?"),
        ...answer([
          "@Autowired dit a Spring d'injecter automatiquement une dependance.",
          "Depuis Spring 4.3 : si une classe n'a QU'UN SEUL constructeur, @Autowired est implicite.",
          "C'est pourquoi dans notre projet, on n'utilise pas @Autowired — un seul constructeur suffit.",
          "Bonne pratique : toujours preferer l'injection par constructeur (plutot que @Autowired sur les champs)."
        ]),

        difficultyTag("Moyen"),
        question("Expliquez le cycle de vie d'un bean Spring."),
        ...answer([
          "1. Instanciation : Spring cree l'objet (new).",
          "2. Injection des dependances : les champs et constructeurs sont resolus.",
          "3. @PostConstruct : methode appelee apres l'injection.",
          "4. Le bean est pret et disponible dans le contexte.",
          "5. @PreDestroy : methode appelee avant la destruction.",
          "6. Destruction : quand le contexte se ferme.",
          "Scopes : singleton (defaut, une seule instance), prototype (nouvelle instance a chaque injection), request, session."
        ]),

        question("Comment fonctionne @Transactional ?"),
        ...answer([
          "@Transactional enveloppe la methode dans une transaction. Si la methode reussit : commit. Si elle leve une exception : rollback.",
          "Spring utilise un proxy AOP : il cree un proxy autour du bean qui gere begin/commit/rollback.",
          "ATTENTION : @Transactional ne fonctionne PAS si on appelle une methode @Transactional depuis la meme classe (le proxy est contourne).",
          "Par defaut, rollback uniquement sur les RuntimeException. Pour les checked exceptions : @Transactional(rollbackFor = Exception.class).",
          "Dans notre projet : @Transactional sur AuthServiceImpl.register() — si le save echoue, tout est annule."
        ]),

        question("Qu'est-ce que Spring Security et comment fonctionne la chaine de filtres ?"),
        ...answer([
          "Spring Security est un framework d'authentification et d'autorisation.",
          "Il fonctionne avec une chaine de filtres (FilterChain) qui intercepte chaque requete HTTP.",
          "Dans notre projet : JwtAuthenticationFilter extrait le token JWT du header Authorization, le valide, et place l'utilisateur dans le SecurityContext.",
          "SecurityConfig definit : quels endpoints sont publics (/auth/**), lesquels necessitent un role (ADMIN), et la politique de session (STATELESS pour JWT).",
          "Le DaoAuthenticationProvider utilise DtfUserDetailsService pour charger l'utilisateur depuis la base."
        ]),

        difficultyTag("Difficile"),
        question("Expliquez la difference entre @ConfigurationProperties et @Value."),
        ...answer([
          "@Value(\"${app.jwt.secret}\") : injecte une seule propriete. Simple mais fragile (string magique).",
          "@ConfigurationProperties(prefix = \"app.jwt\") : mappe un groupe de proprietes vers un objet type-safe.",
          "Dans notre projet : JwtProperties est un record avec @ConfigurationProperties. Avantage : auto-completion, validation, refactoring facile.",
          "Il faut activer avec @EnableConfigurationProperties (fait dans AppConfig)."
        ]),

        question("Comment Spring Boot auto-configure les beans ?"),
        ...answer([
          "Spring Boot utilise les fichiers META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.",
          "Chaque auto-configuration est conditionnelle : @ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty.",
          "Exemple : si spring-boot-starter-data-jpa est dans le classpath ET qu'une DataSource est configuree, Spring cree automatiquement un EntityManagerFactory.",
          "On peut desactiver : @SpringBootApplication(exclude = DataSourceAutoConfiguration.class)."
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════
        // JPA / HIBERNATE
        // ═══════════════════════════════════════════════════
        h1("3. JPA et Hibernate"),

        h2("3.1 Fondamentaux"),
        difficultyTag("Facile"),
        question("Quelle est la difference entre JPA et Hibernate ?"),
        ...answer([
          "JPA (Jakarta Persistence API) : c'est la SPECIFICATION (un ensemble d'interfaces et d'annotations).",
          "Hibernate : c'est une IMPLEMENTATION de JPA (la plus populaire).",
          "Analogie : JPA est le port (interface), Hibernate est l'adapter (implementation). Exactement comme notre architecture hexagonale !",
          "Autres implementations : EclipseLink, OpenJPA."
        ]),

        question("Expliquez les annotations @Entity, @Table, @Id, @Column."),
        ...answer([
          "@Entity : marque une classe comme entite JPA (sera mappee a une table).",
          "@Table(name = \"utilisateurs\") : nom de la table en base (si different du nom de classe).",
          "@Id : cle primaire.",
          "@GeneratedValue(strategy = GenerationType.UUID) : generation automatique de l'id.",
          "@Column(unique = true, nullable = false) : contraintes sur la colonne.",
          "Dans notre projet : ces annotations sont sur UtilisateurJpaEntity (infrastructure), PAS sur Utilisateur (domaine)."
        ]),

        difficultyTag("Moyen"),
        question("Qu'est-ce que le probleme du N+1 et comment le resoudre ?"),
        ...answer([
          "Probleme N+1 : quand on charge une entite avec une relation @OneToMany, JPA fait 1 requete pour l'entite parent + N requetes pour chaque enfant.",
          "Exemple : charger 10 utilisateurs avec leurs fichiers = 1 + 10 = 11 requetes au lieu d'1.",
          "Solutions :",
          "  1. @EntityGraph : JOIN FETCH au niveau de l'annotation",
          "  2. @Query(\"SELECT u FROM User u JOIN FETCH u.files\") : JPQL avec fetch",
          "  3. FetchType.LAZY (defaut pour @OneToMany) + fetch explicite quand necessaire",
          "  4. Utiliser des projections (DTOs) au lieu de charger l'entite complete"
        ]),

        question("Quelle est la difference entre FetchType.LAZY et EAGER ?"),
        ...answer([
          "EAGER : la relation est chargee immediatement avec l'entite parente. Chaque fois qu'on charge un User, ses fichiers sont aussi charges.",
          "LAZY : la relation n'est chargee que quand on y accede (proxy). Attention : LazyInitializationException si la session est fermee.",
          "Defauts : @ManyToOne = EAGER, @OneToMany = LAZY.",
          "Bonne pratique : TOUJOURS mettre LAZY et fetcher explicitement quand necessaire.",
          "Notre projet : open-in-view: false dans application.yml — pas de session ouverte dans la vue."
        ]),

        question("Qu'est-ce que le Dirty Checking dans Hibernate ?"),
        ...answer([
          "Hibernate compare l'etat actuel d'une entite managed avec son etat initial (snapshot).",
          "Si des champs ont change, Hibernate genere automatiquement un UPDATE au flush.",
          "Avantage : pas besoin d'appeler save() explicitement sur une entite deja managed.",
          "Inconvenient : peut generer des UPDATE inattendus si on modifie une entite par accident.",
          "Le flush se produit : avant un commit, avant une requete JPQL, ou manuellement."
        ]),

        difficultyTag("Difficile"),
        question("Expliquez les etats d'une entite JPA (lifecycle)."),
        ...answer([
          "1. NEW (Transient) : l'objet Java existe mais n'est pas gere par JPA. Aucun id persistant.",
          "2. MANAGED : l'entite est dans le persistence context. Tout changement sera detecte (dirty checking).",
          "3. DETACHED : l'entite etait managed mais le persistence context est ferme. Les modifications ne sont plus trackees.",
          "4. REMOVED : l'entite est marquee pour suppression. Sera DELETE au prochain flush.",
          "Transitions : persist() -> MANAGED, find() -> MANAGED, detach() -> DETACHED, merge() -> MANAGED, remove() -> REMOVED."
        ]),

        question("Qu'est-ce que le First Level Cache et le Second Level Cache ?"),
        ...answer([
          "First Level Cache (L1) : lie au persistence context (EntityManager). Automatique, pas desactivable. Si on fait em.find(User, 1) deux fois, une seule requete SQL.",
          "Second Level Cache (L2) : partage entre tous les EntityManagers. Optionnel (EhCache, Hazelcast). Cache les entites frequemment lues.",
          "Query Cache : cache le resultat des requetes JPQL. Combine avec L2 pour etre efficace.",
          "Attention : le L2 cache peut causer des problemes de coherence en environnement distribue."
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════
        // DOCKER
        // ═══════════════════════════════════════════════════
        h1("4. Docker"),

        difficultyTag("Facile"),
        question("Qu'est-ce que Docker et quelle est la difference avec une VM ?"),
        ...answer([
          "Docker execute des conteneurs : des processus isoles qui partagent le noyau de l'hote.",
          "VM : virtualise un OS complet (noyau + userland). Lourd (Go de RAM), demarrage lent.",
          "Conteneur : isole au niveau processus. Leger (Mo), demarrage en secondes.",
          "Docker utilise des namespaces (isolation) et cgroups (limitation de ressources) du noyau Linux."
        ]),

        question("Quelle est la difference entre une image et un conteneur ?"),
        ...answer([
          "Image : template en lecture seule. C'est le plan de construction. Immuable.",
          "Conteneur : instance en execution d'une image. Mutable (mais les changements sont perdus a la destruction).",
          "Analogie : l'image est la recette, le conteneur est le plat prepare. On peut preparer plusieurs plats (conteneurs) a partir de la meme recette (image)."
        ]),

        question("Expliquez le docker-compose.yml du projet."),
        ...answer([
          "Notre docker-compose.yml definit un service PostgreSQL :",
          "  - image: postgres:16-alpine (image legere de PostgreSQL 16)",
          "  - ports: 5434:5432 (port hote:conteneur, evite les conflits avec un PostgreSQL local)",
          "  - volumes: fileshared-pgdata (persistance des donnees entre redemarrages)",
          "  - healthcheck: verifie que PostgreSQL est pret avant que l'application se connecte",
          "Commande : docker compose up -d (lancer en arriere-plan)"
        ]),

        difficultyTag("Moyen"),
        question("Qu'est-ce qu'un Dockerfile multi-stage et pourquoi l'utiliser ?"),
        ...answer([
          "Un Dockerfile multi-stage utilise plusieurs FROM. Chaque stage est independant.",
          "Stage 1 (build) : contient le JDK, Maven, les sources. Compile l'application.",
          "Stage 2 (runtime) : contient uniquement le JRE et le .jar compile.",
          "Avantage : l'image finale est 3-5x plus petite (pas de JDK, pas de sources, pas de Maven).",
          "Exemple : FROM maven:3.9-eclipse-temurin-21 AS build ... FROM eclipse-temurin:21-jre-alpine AS runtime"
        ]),

        question("Comment gerer les secrets dans Docker ?"),
        ...answer([
          "JAMAIS de secrets dans le Dockerfile ou l'image (ils sont visibles avec docker history).",
          "Solutions :",
          "  1. Variables d'environnement : docker run -e JWT_SECRET=... (acceptable pour le dev)",
          "  2. Docker Secrets (Swarm) : secrets chiffres, montes en fichiers dans le conteneur",
          "  3. Fichier .env avec docker compose (NE PAS commiter dans git)",
          "  4. Vault (HashiCorp) ou AWS Secrets Manager pour la production",
          "Notre projet : le secret JWT est en dur dans application.yml — a externaliser en variable d'environnement."
        ]),

        difficultyTag("Difficile"),
        question("Expliquez les layers Docker et le cache de build."),
        ...answer([
          "Chaque instruction du Dockerfile (FROM, RUN, COPY) cree un layer.",
          "Docker cache les layers : si une instruction n'a pas change, le layer est reutilise.",
          "Ordre optimal pour un projet Java :",
          "  1. COPY pom.xml (change rarement)",
          "  2. RUN mvn dependency:resolve (cache les dependances)",
          "  3. COPY src/ (change souvent)",
          "  4. RUN mvn package",
          "Si seul le code source change, seuls les layers 3-4 sont reconstruits. Les dependances restent en cache."
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════
        // ARCHITECTURE
        // ═══════════════════════════════════════════════════
        h1("5. Architecture et Design Patterns"),

        h2("5.1 Architecture Hexagonale"),
        difficultyTag("Facile"),
        question("Qu'est-ce que l'architecture hexagonale ? Expliquez en 30 secondes."),
        ...answer([
          "C'est une architecture ou le code metier (domaine) est au centre et ne depend de rien d'externe.",
          "Le domaine definit des ports (interfaces) : ce qu'il sait faire (ports entrants) et ce dont il a besoin (ports sortants).",
          "L'infrastructure fournit des adapters qui implementent ces ports : JPA pour la persistance, JWT pour les tokens, REST pour le web.",
          "Les dependances vont toujours de l'exterieur vers l'interieur."
        ]),

        question("Quelle est la difference entre un port entrant et un port sortant ?"),
        ...answer([
          "Port entrant (Driving) : ce que l'application SAIT FAIRE. Interface qui definit un use case.",
          "  Exemple : RegisterUseCase avec la methode register(RegisterCommand).",
          "  Qui l'appelle : le controller REST, une CLI, un test.",
          "Port sortant (Driven) : ce dont l'application A BESOIN. Interface qui definit une dependance externe.",
          "  Exemple : UtilisateurRepository, TokenProvider, PasswordHasher.",
          "  Qui l'implemente : les adapters (JPA, JWT, BCrypt)."
        ]),

        difficultyTag("Moyen"),
        question("Pourquoi separer l'entite domaine de l'entite JPA ?"),
        ...answer([
          "L'entite domaine est un POJO pur : elle contient la logique metier sans annotation framework.",
          "L'entite JPA est couplee a Hibernate : @Entity, @Column, @Id, @GeneratedValue.",
          "Si on les fusionne, le domaine depend de JPA. On ne peut plus tester le domaine sans Hibernate.",
          "Avec la separation : on peut changer de base de donnees (JPA -> MongoDB) sans toucher au domaine.",
          "Le cout : un mapper (UtilisateurMapper.toDomain() / toJpa()). C'est un bon trade-off."
        ]),

        question("Quelle est la difference entre un DTO et une Command ?"),
        ...answer([
          "DTO (Data Transfer Object) : objet de la couche web pour le transport HTTP. Contient des annotations de validation (@Email, @NotBlank).",
          "  Exemple : RegisterRequest — c'est ce que le frontend envoie.",
          "Command : objet du domaine qui exprime une intention metier. Aucune annotation framework.",
          "  Exemple : RegisterCommand — c'est ce que le domaine comprend.",
          "Le controller fait le mapping : RegisterRequest -> RegisterCommand via AuthWebMapper."
        ]),

        difficultyTag("Difficile"),
        question("Comment testez-vous chaque couche dans une architecture hexagonale ?"),
        ...answer([
          "Domaine : tests unitaires purs (JUnit + mocks des ports). Zero Spring, zero base de donnees.",
          "  Exemple : tester AuthServiceImpl en mockant UtilisateurRepository, PasswordHasher, TokenProvider.",
          "Application : meme chose que le domaine (les services sont testes via les ports).",
          "Infrastructure :",
          "  - Adapters de persistance : @DataJpaTest (Spring Boot + H2 en memoire)",
          "  - Controllers : @WebMvcTest (teste le controller sans demarrer toute l'app)",
          "  - Integration complete : @SpringBootTest + Testcontainers (PostgreSQL en Docker)"
        ]),

        question("Expliquez les principes SOLID et comment ils s'appliquent a votre projet."),
        ...answer([
          "S — Single Responsibility : AuthServiceImpl ne fait QUE l'inscription. Le controller ne fait QUE le mapping HTTP.",
          "O — Open/Closed : on peut ajouter un PasetoTokenAdapter sans modifier le domaine.",
          "L — Liskov Substitution : tout adapter (JPA, MongoDB) est interchangeable derriere le port.",
          "I — Interface Segregation : TokenProvider, PasswordHasher, UtilisateurRepository sont des interfaces separees (pas une mega-interface).",
          "D — Dependency Inversion : AuthServiceImpl depend de UtilisateurRepository (abstraction), pas de JpaUtilisateurRepository (implementation)."
        ]),

        h2("5.2 DDD (Domain-Driven Design)"),
        difficultyTag("Moyen"),
        question("Qu'est-ce qu'un Bounded Context ?"),
        ...answer([
          "Un Bounded Context est une frontiere logique dans laquelle un modele de domaine est coherent.",
          "Dans notre projet : 'identity' est un bounded context (utilisateurs, roles, authentification).",
          "Futur : on ajoutera 'file' (upload, chiffrement), 'sharing' (liens temporaires). Chaque contexte a ses propres entites, ports et adapters.",
          "Les contextes communiquent entre eux via des interfaces definies, pas en partageant des entites."
        ]),

        question("Quelle est la difference entre une Entity et un Value Object en DDD ?"),
        ...answer([
          "Entity : a une identite unique (UUID). Deux entites avec les memes attributs mais des IDs differents sont DIFFERENTES.",
          "  Exemple : Utilisateur — meme email, meme nom, mais IDs differents = deux utilisateurs distincts.",
          "Value Object : defini par ses attributs, pas par une identite. Deux VO avec les memes attributs sont IDENTIQUES.",
          "  Exemple : une adresse email 'admin@bomunto.com' est la meme peu importe ou elle est utilisee.",
          "Les Value Objects sont immutables. On les remplace, on ne les modifie pas."
        ]),

        difficultyTag("Expert"),
        question("Qu'est-ce qu'un Aggregate et un Aggregate Root ?"),
        ...answer([
          "Un Aggregate est un cluster d'entites et value objects traites comme une unite.",
          "L'Aggregate Root est l'entite principale par laquelle on accede a l'aggregate.",
          "Regle : le monde exterieur ne peut acceder aux objets internes de l'aggregate QUE par le root.",
          "Exemple : si Utilisateur avait des Fichiers, l'Aggregate Root serait Utilisateur. On ne manipule jamais un Fichier sans passer par son Utilisateur.",
          "Le Repository ne concerne que l'Aggregate Root : UtilisateurRepository, pas FichierRepository."
        ]),

        question("Comment gerez-vous les evenements domaine (Domain Events) ?"),
        ...answer([
          "Un Domain Event capture un fait metier qui s'est produit : UtilisateurInscrit, FichierUploade.",
          "Le domaine emet l'evenement, l'infrastructure le distribue (Spring Events, Kafka, RabbitMQ).",
          "Avantage : decouplage. L'inscription n'a pas besoin de savoir qu'un email de bienvenue sera envoye.",
          "Implementation : l'entite domaine accumule les evenements, le service les publie apres le save.",
          "Pattern : l'entite a une liste d'evenements, et un publisher dans l'infrastructure les dispatche."
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ═══════════════════════════════════════════════════
        // QUESTIONS PIEGES
        // ═══════════════════════════════════════════════════
        h1("6. Questions pieges et cas pratiques"),

        difficultyTag("Expert"),
        question("Votre AuthServiceImpl utilise @Service (Spring). Le domaine est-il vraiment pur ?"),
        ...answer([
          "Bonne observation. AuthServiceImpl est dans la couche APPLICATION, pas dans le domaine.",
          "La couche application est le seul endroit ou on tolere @Service et @Transactional — ce sont des annotations de wiring, pas de logique metier.",
          "Le DOMAINE (entites, ports, exceptions) est 100% pur : zero annotation Spring, zero import framework.",
          "Si on voulait etre puriste a 100%, on pourrait configurer le bean dans une @Configuration dediee au lieu d'utiliser @Service."
        ]),

        question("Votre UtilisateurDto importe Utilisateur du domaine. N'est-ce pas une violation ?"),
        ...answer([
          "Non. La dependance va dans le bon sens : infrastructure -> domaine.",
          "UtilisateurDto (infrastructure) connait Utilisateur (domaine) pour faire le mapping.",
          "L'inverse serait une violation : si Utilisateur (domaine) importait UtilisateurDto (infrastructure).",
          "Regle : le domaine ne connait JAMAIS l'infrastructure. L'infrastructure peut connaitre le domaine."
        ]),

        question("Pourquoi avoir un bean PasswordEncoder dans SecurityConfig ET un BcryptPasswordAdapter ?"),
        ...answer([
          "Ce sont deux preoccupations differentes :",
          "BcryptPasswordAdapter implemente PasswordHasher (port domaine). Il est utilise par AuthServiceImpl pour hasher les mots de passe a l'inscription.",
          "Le bean PasswordEncoder est requis par DaoAuthenticationProvider (Spring Security) pour verifier les credentials au login.",
          "Les deux utilisent BCrypt, mais ils servent des clients differents. On pourrait faire en sorte que BcryptPasswordAdapter expose aussi un bean PasswordEncoder, mais ce serait mixer les responsabilites."
        ]),

        question("Si vous deviez ajouter l'envoi d'email apres inscription, ou le mettriez-vous ?"),
        ...answer([
          "1. Creer un port sortant dans le domaine : EmailSender avec la methode sendWelcome(Utilisateur).",
          "2. Creer un adapter dans l'infrastructure : SmtpEmailAdapter implements EmailSender (utilise Spring Mail).",
          "3. Injecter EmailSender dans AuthServiceImpl et appeler sendWelcome() apres le save.",
          "Alternative (meilleure) : emettre un Domain Event UtilisateurInscrit, et un listener dans l'infrastructure envoie l'email. Avantage : le service d'inscription ne connait meme pas l'existence de l'email."
        ]),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(__dirname + "/questions-entretien-technique.docx", buffer);
  console.log("Document entretien genere");
});
