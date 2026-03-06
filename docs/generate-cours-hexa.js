const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents,
  ImageRun
} = require("docx");

const schemaImage = fs.readFileSync(__dirname + "/schema-hexagonal.png");

// ── Styles ──────────────────────────────────────────────────────
const COLORS = {
  primary: "1B4F72",
  secondary: "2E86C1",
  accent: "E74C3C",
  bg: "EBF5FB",
  bgCode: "F4F6F7",
  bgTip: "E8F8F5",
  bgWarn: "FEF9E7",
  dark: "2C3E50",
  gray: "7F8C8D",
  black: "000000",
  white: "FFFFFF",
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "D5D8DC" };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

// ── Helpers ─────────────────────────────────────────────────────
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });

const p = (t, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  ...opts,
  children: Array.isArray(t) ? t : [new TextRun({ text: t, font: "Arial", size: 22, ...opts.run })],
});

const bold = (t) => new TextRun({ text: t, bold: true, font: "Arial", size: 22 });
const normal = (t) => new TextRun({ text: t, font: "Arial", size: 22 });
const italic = (t) => new TextRun({ text: t, italics: true, font: "Arial", size: 22 });
const colored = (t, color) => new TextRun({ text: t, font: "Arial", size: 22, color });

const codeLine = (t) => new Paragraph({
  spacing: { after: 0 },
  indent: { left: 360 },
  children: [new TextRun({ text: t, font: "Courier New", size: 18, color: COLORS.dark })],
});

const codeBlock = (lines) => {
  const result = [];
  result.push(new Paragraph({ spacing: { before: 120, after: 0 }, children: [] }));
  for (const line of lines) {
    result.push(new Paragraph({
      spacing: { after: 0 },
      shading: { fill: COLORS.bgCode, type: ShadingType.CLEAR },
      indent: { left: 360, right: 360 },
      children: [new TextRun({ text: line || " ", font: "Courier New", size: 17, color: COLORS.dark })],
    }));
  }
  result.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  return result;
};

const tipBox = (title, text) => [
  new Paragraph({
    spacing: { before: 200, after: 60 },
    shading: { fill: COLORS.bgTip, type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: `  ${title}`, bold: true, font: "Arial", size: 22, color: "1A8870" })],
  }),
  new Paragraph({
    spacing: { after: 200 },
    shading: { fill: COLORS.bgTip, type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: `  ${text}`, font: "Arial", size: 20, color: "1A8870" })],
  }),
];

const warnBox = (title, text) => [
  new Paragraph({
    spacing: { before: 200, after: 60 },
    shading: { fill: COLORS.bgWarn, type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: `  ${title}`, bold: true, font: "Arial", size: 22, color: "9A7D0A" })],
  }),
  new Paragraph({
    spacing: { after: 200 },
    shading: { fill: COLORS.bgWarn, type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: `  ${text}`, font: "Arial", size: 20, color: "9A7D0A" })],
  }),
];

const bullet = (ref, t, opts = {}) => new Paragraph({
  numbering: { reference: ref, level: 0 },
  spacing: { after: 60 },
  children: Array.isArray(t) ? t : [new TextRun({ text: t, font: "Arial", size: 22, ...opts })],
});

const spacer = () => new Paragraph({ spacing: { after: 120 }, children: [] });

// ── Build document ──────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: COLORS.primary, font: "Arial" },
        paragraph: { spacing: { before: 600, after: 200 }, alignment: AlignmentType.CENTER },
      },
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLORS.primary, font: "Arial" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: COLORS.secondary, font: "Arial" },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: COLORS.dark, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets", levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "num1", levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "num2", levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "num3", levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "num4", levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets2", levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets3", levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets4", levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ═══════════════════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════════════════
    {
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [
        spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 200 },
          children: [new TextRun({ text: "Architecture Hexagonale & DDD", font: "Arial", size: 56, bold: true, color: COLORS.primary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 100 },
          children: [new TextRun({ text: "Cours pratique avec le projet FileShared", font: "Arial", size: 32, color: COLORS.secondary })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 400 },
          children: [new TextRun({ text: "Java 21  |  Spring Boot 4  |  PostgreSQL", font: "Arial", size: 24, color: COLORS.gray })],
        }),
        spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [new TextRun({ text: "Bomunto", font: "Arial", size: 28, bold: true, color: COLORS.dark })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [new TextRun({ text: "Mars 2026", font: "Arial", size: 22, color: COLORS.gray })],
        }),
      ],
    },

    // ═══════════════════════════════════════════════════════════
    // TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════
    {
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Architecture Hexagonale & DDD", font: "Arial", size: 18, color: COLORS.gray, italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", font: "Arial", size: 18, color: COLORS.gray }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: COLORS.gray }), new TextRun({ text: " / ", font: "Arial", size: 18, color: COLORS.gray }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: COLORS.gray })],
          })],
        }),
      },
      children: [
        h1("Table des matieres"),
        new TableOfContents("Table des matieres", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 1 : INTRODUCTION
        // ═════════════════════════════════════════════════════
        h1("Chapitre 1 : Pourquoi l'Architecture Hexagonale ?"),
        spacer(),

        h2("1.1 Le probleme des architectures classiques"),
        p("Dans une architecture traditionnelle en couches (Controller -> Service -> Repository), les couches sont souvent fortement couplees entre elles. Le service metier importe directement des annotations JPA, des classes Spring Security, des DTOs HTTP. Le code metier devient prisonnier du framework."),
        p([
          normal("Consequence : "),
          bold("impossible de tester le metier sans demarrer Spring"),
          normal(", impossible de changer de base de donnees sans recrire les services, impossible de migrer vers un autre framework sans tout casser."),
        ]),
        spacer(),

        h2("1.2 L'Architecture Hexagonale (Ports & Adapters)"),
        p("L'architecture hexagonale, inventee par Alistair Cockburn en 2005, propose une solution radicale : le code metier ne depend de RIEN d'externe. Il definit des interfaces (les ports) que le monde exterieur doit implementer (les adapters)."),
        spacer(),
        p([bold("Les 3 principes fondamentaux :")]),
        bullet("num1", [bold("Le domaine est au centre."), normal(" Il ne connait ni Spring, ni JPA, ni HTTP. Il ne contient que des regles metier pures.")]),
        bullet("num1", [bold("Les ports definissent les contrats."), normal(" Ce sont des interfaces Java dans le domaine qui decrivent ce dont le metier a besoin (sauvegarder un utilisateur, hasher un mot de passe, generer un token).")]),
        bullet("num1", [bold("Les adapters implementent les ports."), normal(" Ils vivent dans l'infrastructure et contiennent le code technique : JPA pour la persistance, BCrypt pour le hachage, JWT pour les tokens.")]),
        spacer(),

        ...tipBox(
          "Analogie",
          "Imagine une prise electrique (le port). Ton appareil (le domaine) a besoin de courant, mais il ne sait pas comment l'electricite est produite. L'adapter, c'est la centrale electrique. Tu peux la remplacer par une autre (solaire, nucleaire) sans changer la prise ni l'appareil."
        ),

        h2("1.3 Schema de l'architecture"),
        p("Voici le schema complet de l'architecture hexagonale du projet FileShared :"),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({
            type: "png",
            data: schemaImage,
            transformation: { width: 580, height: 435 },
            altText: { title: "Architecture Hexagonale", description: "Schema de l'architecture hexagonale FileShared", name: "schema-hexa" },
          })],
        }),
        spacer(),
        p([bold("Lecture du schema : "), normal("Les fleches vont toujours de l'exterieur vers l'interieur. Le Controller (rouge, a gauche) appelle le port entrant RegisterUseCase. Les adapters (vert a droite, violet en bas) implementent les ports sortants. Le domaine au centre ne connait personne.")]),
        spacer(),

        h2("1.4 Les 3 couches de notre projet"),
        p("Notre projet FileShared est organise en 3 couches distinctes :"),
        spacer(),

        new Table({
          columnWidths: [2200, 3200, 3960],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Couche", bold: true, color: COLORS.white, font: "Arial", size: 22 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Responsabilite", bold: true, color: COLORS.white, font: "Arial", size: 22 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3960, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Depend de", bold: true, color: COLORS.white, font: "Arial", size: 22 })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: COLORS.bg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Domaine", bold: true, font: "Arial", size: 22, color: COLORS.primary })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("Entites, regles metier, ports (interfaces)")] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3960, type: WidthType.DXA }, children: [new Paragraph({ children: [bold("RIEN"), normal(" (Java pur uniquement)")] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: COLORS.bg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Application", bold: true, font: "Arial", size: 22, color: COLORS.secondary })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("Use cases, orchestration des ports")] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3960, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("Domaine uniquement")] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: COLORS.bg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Infrastructure", bold: true, font: "Arial", size: 22, color: COLORS.accent })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("Adapters : JPA, JWT, BCrypt, REST controllers, config Spring")] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3960, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("Domaine + Application + frameworks")] })] }),
              ],
            }),
          ],
        }),

        spacer(),
        ...warnBox(
          "Regle d'or",
          "Les dependances vont TOUJOURS de l'exterieur vers l'interieur : Infrastructure -> Application -> Domaine. JAMAIS dans l'autre sens."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 2 : LE DOMAINE
        // ═════════════════════════════════════════════════════
        h1("Chapitre 2 : La couche Domaine — Le coeur pur"),

        h2("2.1 Qu'est-ce que le Domaine ?"),
        p("Le domaine est le coeur de l'application. Il contient uniquement la logique metier, les entites, les regles de validation, et les contrats (ports). Il ne connait aucun framework, aucune librairie externe."),
        p([bold("Regle absolue : "), normal("aucun import de jakarta.persistence, org.springframework, lombok, ou toute autre librairie dans le domaine.")]),
        spacer(),

        h2("2.2 Structure du domaine dans FileShared"),
        ...codeBlock([
          "domaine/identity/",
          "|-- EntityAbstract.java        <- Classe abstraite pure (createdAt, updatedAt)",
          "|-- Utilisateur.java           <- Entite domaine (POJO pur)",
          "|-- Role.java                  <- Enum metier",
          "|-- port/",
          "|   |-- in/                    <- Ports entrants (use cases)",
          "|   |   |-- RegisterUseCase.java",
          "|   |   |-- RegisterCommand.java",
          "|   |   |-- AuthResult.java",
          "|   |-- out/                   <- Ports sortants",
          "|       |-- UtilisateurRepository.java",
          "|       |-- TokenProvider.java",
          "|       |-- PasswordHasher.java",
          "|-- exception/",
          "    |-- EmailDejaUtiliseException.java",
        ]),
        spacer(),

        h2("2.3 La classe abstraite EntityAbstract"),
        p("Beaucoup d'entites partagent des champs d'audit (date de creation, date de modification). On les factorise dans une classe abstraite. Mais attention : dans le domaine, cette classe doit etre 100% pure."),
        spacer(),
        h3("AVANT (couple a JPA) :"),
        ...codeBlock([
          "// MAUVAIS - Le domaine depend de JPA et Spring",
          "import jakarta.persistence.Column;",
          "import jakarta.persistence.MappedSuperclass;",
          "import jakarta.persistence.EntityListeners;",
          "import org.springframework.data.jpa.domain.support.AuditingEntityListener;",
          "",
          "@MappedSuperclass",
          "@EntityListeners(AuditingEntityListener.class)",
          "abstract class EntityAbstract {",
          "    @Column(name = \"created_at\")",
          "    private Instant createdAt;",
          "    @Column(name = \"updated_at\")",
          "    private Instant updatedAt;",
          "}",
        ]),
        spacer(),
        h3("APRES (domaine pur) :"),
        ...codeBlock([
          "// BON - Zero dependance externe",
          "package com.bomunto.fileshared.domaine.identity;",
          "",
          "import java.time.Instant;",
          "",
          "abstract class EntityAbstract {",
          "    private Instant createdAt;",
          "    private Instant updatedAt;",
          "",
          "    public EntityAbstract(Instant createdAt, Instant updatedAt) {",
          "        this.createdAt = createdAt;",
          "        this.updatedAt = updatedAt;",
          "    }",
          "",
          "    public EntityAbstract() { }",
          "",
          "    public Instant getCreatedAt() { return createdAt; }",
          "    public Instant getUpdatedAt() { return updatedAt; }",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Pourquoi pas Lombok ?",
          "Lombok (@Getter, @Setter, @Builder) est une librairie externe. Meme si elle genere du code a la compilation, elle cree une dependance. Dans le domaine pur, on ecrit les getters/constructeurs a la main. C'est un peu plus verbeux, mais le domaine ne depend de RIEN."
        ),

        h2("2.4 L'entite Utilisateur"),
        p("L'entite Utilisateur est un POJO (Plain Old Java Object) pur. Pas d'annotation, pas de framework."),
        spacer(),
        h3("AVANT (couple a JPA + Lombok) :"),
        ...codeBlock([
          "@Entity                     // <- JPA",
          "@Getter                     // <- Lombok",
          "@AllArgsConstructor         // <- Lombok",
          "@NoArgsConstructor          // <- Lombok",
          "@Builder                    // <- Lombok",
          "public class Utilisateur extends EntityAbstract {",
          "    @Id",
          "    @GeneratedValue(strategy = GenerationType.UUID)",
          "    private UUID id;",
          "",
          "    @Column(unique = true, nullable = false)",
          "    private String username;",
          "    // ...",
          "}",
        ]),
        spacer(),
        h3("APRES (POJO pur) :"),
        ...codeBlock([
          "package com.bomunto.fileshared.domaine.identity;",
          "",
          "import java.time.Instant;",
          "import java.util.UUID;",
          "",
          "public class Utilisateur extends EntityAbstract {",
          "    private UUID id;",
          "    private String username;",
          "    private String email;",
          "    private String passwordHash;",
          "    private Role role;",
          "",
          "    public Utilisateur(UUID id, String username, String email,",
          "                       String passwordHash, Role role,",
          "                       Instant createdAt, Instant updatedAt) {",
          "        super(createdAt, updatedAt);",
          "        this.id = id;",
          "        this.username = username;",
          "        this.email = email;",
          "        this.passwordHash = passwordHash;",
          "        this.role = role;",
          "    }",
          "",
          "    public Utilisateur() { super(); }",
          "",
          "    public UUID getId() { return id; }",
          "    public String getUsername() { return username; }",
          "    public String getEmail() { return email; }",
          "    public String getPasswordHash() { return passwordHash; }",
          "    public Role getRole() { return role; }",
          "}",
        ]),
        spacer(),
        ...warnBox(
          "Point cle",
          "Remarquez : ZERO import de jakarta.persistence, ZERO annotation @Entity, @Id, @Column. L'entite domaine ne sait meme pas qu'une base de donnees existe."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 3 : LES PORTS
        // ═════════════════════════════════════════════════════
        h1("Chapitre 3 : Les Ports — Les contrats du domaine"),

        h2("3.1 Ports entrants (Driving Ports)"),
        p("Un port entrant definit ce que l'application SAIT FAIRE. C'est une interface qui represente un cas d'utilisation (use case). Le monde exterieur (un controller REST, une CLI, un test) appelle ce port pour declencher une action metier."),
        spacer(),
        p([bold("Exemple : RegisterUseCase")]),
        ...codeBlock([
          "package com.bomunto.fileshared.domaine.identity.port.in;",
          "",
          "public interface RegisterUseCase {",
          "    AuthResult register(RegisterCommand command);",
          "}",
        ]),
        spacer(),
        p("Ce port est accompagne d'objets du domaine pour transporter les donnees :"),
        spacer(),
        h3("RegisterCommand — l'intention metier"),
        ...codeBlock([
          "// Ce que le domaine a besoin pour inscrire quelqu'un",
          "public record RegisterCommand(",
          "    String email,",
          "    String username,",
          "    String motDePasse",
          ") {}",
        ]),
        spacer(),
        h3("AuthResult — le resultat metier"),
        ...codeBlock([
          "// Ce que le domaine retourne apres inscription",
          "public record AuthResult(",
          "    String token,",
          "    String refreshToken,",
          "    Utilisateur utilisateur",
          ") {}",
        ]),
        spacer(),
        ...tipBox(
          "Command vs DTO",
          "RegisterCommand (domaine) exprime une INTENTION metier : \"je veux inscrire quelqu'un\". RegisterRequest (infrastructure/web) est un DTO HTTP : il gere la serialisation JSON, les annotations @Valid, @Email. Ce sont deux objets differents avec des responsabilites differentes. Le controller fait le mapping de l'un vers l'autre."
        ),

        h2("3.2 Ports sortants (Driven Ports)"),
        p("Un port sortant definit ce dont l'application A BESOIN du monde exterieur. C'est une interface que l'infrastructure doit implementer."),
        spacer(),
        h3("UtilisateurRepository — le port de persistance"),
        ...codeBlock([
          "package com.bomunto.fileshared.domaine.identity.port.out;",
          "",
          "public interface UtilisateurRepository {",
          "    Utilisateur save(Utilisateur utilisateur);",
          "    Optional<Utilisateur> findByEmail(String email);",
          "    Optional<Utilisateur> findByUsername(String username);",
          "    boolean existsByEmail(String email);",
          "    long count();",
          "}",
        ]),
        spacer(),
        p([normal("Remarquez : cette interface ne mentionne ni JPA, ni SQL, ni PostgreSQL. Elle dit simplement "), italic("\"j'ai besoin de sauvegarder et chercher des utilisateurs\""), normal(". L'implementation peut etre JPA, MongoDB, un fichier CSV, ou meme un HashMap en memoire pour les tests.")]),
        spacer(),

        h3("TokenProvider — le port de generation de tokens"),
        ...codeBlock([
          "public interface TokenProvider {",
          "    String generateToken(Utilisateur utilisateur);",
          "    String generateRefreshToken(Utilisateur utilisateur);",
          "    String extractUsername(String token);",
          "    boolean isTokenValid(String token, String username);",
          "}",
        ]),
        spacer(),

        h3("PasswordHasher — le port de hachage"),
        ...codeBlock([
          "public interface PasswordHasher {",
          "    String hash(String rawPassword);",
          "    boolean matches(String rawPassword, String hashedPassword);",
          "}",
        ]),
        spacer(),
        ...warnBox(
          "Pourquoi des ports pour le token et le mot de passe ?",
          "Sans ces ports, AuthService devrait importer directement JwtService (qui depend de io.jsonwebtoken) et PasswordEncoder (Spring Security). Le domaine serait couple a ces librairies. Avec les ports, on peut changer JWT pour Paseto, ou BCrypt pour Argon2, sans toucher au domaine."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 4 : EXCEPTIONS DOMAINE
        // ═════════════════════════════════════════════════════
        h1("Chapitre 4 : Les Exceptions Domaine"),

        h2("4.1 Pourquoi des exceptions metier ?"),
        p("Dans le code original, les erreurs metier etaient signalees avec des IllegalArgumentException generiques :"),
        ...codeBlock([
          "// AVANT - exception generique",
          "throw new IllegalArgumentException(",
          "    \"Un compte avec cet email existe deja\"",
          ");",
        ]),
        spacer(),
        p("Le probleme : le controller ne peut pas distinguer un email duplique d'un parametre invalide. Toutes les erreurs se ressemblent."),
        spacer(),

        h2("4.2 Exceptions custom dans le domaine"),
        ...codeBlock([
          "package com.bomunto.fileshared.domaine.identity.exception;",
          "",
          "public class EmailDejaUtiliseException extends RuntimeException {",
          "    public EmailDejaUtiliseException(String email) {",
          "        super(\"Un compte avec l'email \" + email",
          "              + \" existe deja\");",
          "    }",
          "}",
        ]),
        spacer(),
        p([bold("Avantages :"),]),
        bullet("bullets2", "Le domaine exprime ses erreurs avec precision"),
        bullet("bullets2", "L'infrastructure peut mapper chaque exception a un code HTTP specifique (409 Conflict pour un doublon, 404 pour non trouve, etc.)"),
        bullet("bullets2", "Les tests peuvent verifier le type d'erreur exact"),
        spacer(),

        h2("4.3 Traduction en HTTP (cote infrastructure)"),
        p("Un @ControllerAdvice dans l'infrastructure traduira ces exceptions en reponses HTTP :"),
        ...codeBlock([
          "// infrastructure/web/GlobalExceptionHandler.java",
          "@RestControllerAdvice",
          "public class GlobalExceptionHandler {",
          "",
          "    @ExceptionHandler(EmailDejaUtiliseException.class)",
          "    public ResponseEntity<ErrorResponse> handleEmailDuplique(",
          "            EmailDejaUtiliseException ex) {",
          "        return ResponseEntity",
          "            .status(HttpStatus.CONFLICT)",
          "            .body(new ErrorResponse(ex.getMessage()));",
          "    }",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Pattern",
          "Le domaine LEVE l'exception. L'infrastructure la TRADUIT. Le domaine ne sait pas ce qu'est un code HTTP. L'infrastructure ne sait pas ce qu'est un email duplique. Chacun sa responsabilite."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 5 : COUCHE APPLICATION
        // ═════════════════════════════════════════════════════
        h1("Chapitre 5 : La couche Application — L'orchestrateur"),

        h2("5.1 Role de la couche Application"),
        p("La couche application contient les services qui IMPLEMENTENT les ports entrants. Elle orchestre les appels aux ports sortants pour realiser les cas d'utilisation. Elle ne contient PAS de logique metier complexe — elle delegue au domaine."),
        spacer(),
        p([bold("Structure :")]),
        ...codeBlock([
          "application/identity/",
          "|-- service/",
          "    |-- AuthServiceImpl.java   <- Implemente RegisterUseCase",
        ]),

        h2("5.2 AuthServiceImpl — avant vs apres"),
        spacer(),
        h3("AVANT (couple a l'infrastructure) :"),
        ...codeBlock([
          "// MAUVAIS - depend de classes concretes de l'infra",
          "@Service",
          "public class AuthService {",
          "    // Depend de l'ADAPTER concret, pas du PORT",
          "    private final UtilisateurRepositoryAdapter utilisateurRepository;",
          "    // Depend de Spring Security directement",
          "    private final PasswordEncoder passwordEncoder;",
          "    // Depend de la classe JWT concrete",
          "    private final JwtService jwtService;",
          "    // ...",
          "}",
        ]),
        spacer(),
        p([colored("Probleme : ", COLORS.accent), normal("AuthService importe des classes de l'infrastructure. Si on change JPA pour MongoDB, ou JWT pour Paseto, il faut modifier le service applicatif. La couche application est couplee a l'infrastructure.")]),
        spacer(),

        h3("APRES (depend uniquement des ports) :"),
        ...codeBlock([
          "package com.bomunto.fileshared.application.identity.service;",
          "",
          "import com.bomunto.fileshared.domaine.identity.*;",
          "import com.bomunto.fileshared.domaine.identity.exception.*;",
          "import com.bomunto.fileshared.domaine.identity.port.in.*;",
          "import com.bomunto.fileshared.domaine.identity.port.out.*;",
          "import org.springframework.stereotype.Service;",
          "import jakarta.transaction.Transactional;",
          "import java.time.Instant;",
          "",
          "@Service",
          "public class AuthServiceImpl implements RegisterUseCase {",
          "",
          "    private final UtilisateurRepository utilisateurRepository;",
          "    private final PasswordHasher passwordHasher;",
          "    private final TokenProvider tokenProvider;",
          "",
          "    public AuthServiceImpl(",
          "            UtilisateurRepository utilisateurRepository,",
          "            PasswordHasher passwordHasher,",
          "            TokenProvider tokenProvider) {",
          "        this.utilisateurRepository = utilisateurRepository;",
          "        this.passwordHasher = passwordHasher;",
          "        this.tokenProvider = tokenProvider;",
          "    }",
          "",
          "    @Override",
          "    @Transactional",
          "    public AuthResult register(RegisterCommand command) {",
          "        if (utilisateurRepository.existsByEmail(",
          "                command.email())) {",
          "            throw new EmailDejaUtiliseException(",
          "                command.email());",
          "        }",
          "",
          "        Utilisateur utilisateur = new Utilisateur(",
          "            null,",
          "            command.username(),",
          "            command.email(),",
          "            passwordHasher.hash(command.motDePasse()),",
          "            Role.USER,",
          "            Instant.now(),",
          "            Instant.now()",
          "        );",
          "",
          "        Utilisateur saved =",
          "            utilisateurRepository.save(utilisateur);",
          "        String token =",
          "            tokenProvider.generateToken(saved);",
          "        String refreshToken =",
          "            tokenProvider.generateRefreshToken(saved);",
          "",
          "        return new AuthResult(",
          "            token, refreshToken, saved);",
          "    }",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Inversion de dependance",
          "AuthServiceImpl ne connait QUE des interfaces du domaine (UtilisateurRepository, PasswordHasher, TokenProvider). Spring injecte automatiquement les implementations concretes (les adapters) au runtime. C'est le principe D de SOLID : dependre des abstractions, pas des implementations."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 6 : COUCHE INFRASTRUCTURE
        // ═════════════════════════════════════════════════════
        h1("Chapitre 6 : La couche Infrastructure — Les adapters"),

        h2("6.1 Vue d'ensemble"),
        p("L'infrastructure contient TOUT ce qui est technique : persistance, securite, web, configuration. Chaque adapter implemente un port du domaine."),
        spacer(),
        ...codeBlock([
          "infrastructure/",
          "|-- persistence/",
          "|   |-- entity/",
          "|   |   |-- JpaEntityAbstract.java    <- @MappedSuperclass",
          "|   |   |-- UtilisateurJpaEntity.java  <- @Entity JPA",
          "|   |-- mapper/",
          "|   |   |-- UtilisateurMapper.java     <- toDomain() / toJpa()",
          "|   |-- jpa/",
          "|   |   |-- JpaUtilisateurRepository.java  <- Spring Data",
          "|   |-- adapter/",
          "|       |-- UtilisateurRepositoryAdapter.java",
          "|-- security/",
          "|   |-- adapter/",
          "|   |   |-- JwtTokenAdapter.java       <- implemente TokenProvider",
          "|   |   |-- BcryptPasswordAdapter.java <- implemente PasswordHasher",
          "|   |-- DtfUserDetails.java",
          "|   |-- DtfUserDetailsService.java",
          "|   |-- JwtAuthenticationFilter.java",
          "|-- web/",
          "|   |-- controller/",
          "|   |   |-- AuthController.java",
          "|   |-- dto/",
          "|   |   |-- RegisterRequest.java       <- DTO HTTP (validation)",
          "|   |   |-- AuthResponse.java           <- DTO HTTP (reponse)",
          "|   |   |-- UtilisateurDto.java",
          "|   |-- mapper/",
          "|       |-- AuthWebMapper.java          <- DTO <-> Domaine",
          "|-- config/",
          "    |-- SecurityConfig.java",
          "    |-- CorsConfig.java",
          "    |-- ...",
        ]),
        spacer(),

        h2("6.2 La separation entite domaine / entite JPA"),
        p("C'est LE changement le plus important du refactoring. Avant, Utilisateur etait a la fois l'entite metier ET l'entite JPA. Maintenant, chaque monde a sa propre classe :"),
        spacer(),

        new Table({
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Entite Domaine (pur)", bold: true, color: COLORS.white, font: "Arial", size: 22 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: COLORS.accent, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Entite JPA (infrastructure)", bold: true, color: COLORS.white, font: "Arial", size: 22 })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("Utilisateur.java")] }), new Paragraph({ children: [normal("POJO pur, zero annotation")] }), new Paragraph({ children: [normal("Vit dans domaine/identity/")] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [normal("UtilisateurJpaEntity.java")] }), new Paragraph({ children: [normal("@Entity, @Id, @Column...")] }), new Paragraph({ children: [normal("Vit dans infrastructure/persistence/entity/")] })] }),
              ],
            }),
          ],
        }),
        spacer(),

        h3("UtilisateurJpaEntity"),
        ...codeBlock([
          "@Entity",
          "@Table(name = \"utilisateurs\")",
          "public class UtilisateurJpaEntity",
          "        extends JpaEntityAbstract {",
          "",
          "    @Id",
          "    @GeneratedValue(strategy = GenerationType.UUID)",
          "    private UUID id;",
          "",
          "    @Column(unique = true, nullable = false)",
          "    private String username;",
          "",
          "    @Column(unique = true, nullable = false)",
          "    private String email;",
          "",
          "    @Column(name = \"password_hash\")",
          "    private String passwordHash;",
          "",
          "    @Enumerated(EnumType.STRING)",
          "    @Column(name = \"role\", nullable = false)",
          "    private String role;",
          "",
          "    // constructeurs, getters, setters",
          "}",
        ]),
        spacer(),

        h2("6.3 Le Mapper manuel"),
        p("Le mapper fait le pont entre le monde domaine et le monde JPA. Il traduit dans les deux sens :"),
        ...codeBlock([
          "public class UtilisateurMapper {",
          "",
          "    public static Utilisateur toDomain(",
          "            UtilisateurJpaEntity jpa) {",
          "        return new Utilisateur(",
          "            jpa.getId(),",
          "            jpa.getUsername(),",
          "            jpa.getEmail(),",
          "            jpa.getPasswordHash(),",
          "            Role.valueOf(jpa.getRole()),",
          "            jpa.getCreatedAt(),",
          "            jpa.getUpdatedAt()",
          "        );",
          "    }",
          "",
          "    public static UtilisateurJpaEntity toJpa(",
          "            Utilisateur domain) {",
          "        UtilisateurJpaEntity jpa =",
          "            new UtilisateurJpaEntity();",
          "        jpa.setId(domain.getId());",
          "        jpa.setUsername(domain.getUsername());",
          "        jpa.setEmail(domain.getEmail());",
          "        jpa.setPasswordHash(",
          "            domain.getPasswordHash());",
          "        jpa.setRole(domain.getRole().name());",
          "        return jpa;",
          "    }",
          "}",
        ]),
        spacer(),

        h2("6.4 L'Adapter de persistance"),
        p("L'adapter implemente le port du domaine et utilise le mapper pour convertir :"),
        ...codeBlock([
          "@Component",
          "public class UtilisateurRepositoryAdapter",
          "        implements UtilisateurRepository {",
          "",
          "    private final JpaUtilisateurRepository jpa;",
          "",
          "    // constructeur...",
          "",
          "    @Override",
          "    public Utilisateur save(Utilisateur utilisateur) {",
          "        UtilisateurJpaEntity jpaEntity =",
          "            UtilisateurMapper.toJpa(utilisateur);",
          "        UtilisateurJpaEntity saved =",
          "            jpa.save(jpaEntity);",
          "        return UtilisateurMapper.toDomain(saved);",
          "    }",
          "",
          "    @Override",
          "    public Optional<Utilisateur> findByEmail(",
          "            String email) {",
          "        return jpa.findByEmail(email)",
          "            .map(UtilisateurMapper::toDomain);",
          "    }",
          "    // ...",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Le flux complet",
          "Controller recoit RegisterRequest (DTO) -> le mappe en RegisterCommand (domaine) -> appelle RegisterUseCase.register() -> AuthServiceImpl orchestre les ports -> UtilisateurRepositoryAdapter convertit Utilisateur en JpaEntity via le mapper -> JPA persiste -> le mapper reconvertit en Utilisateur domaine -> AuthResult retourne au controller -> le controller mappe en AuthResponse (DTO HTTP)."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 7 : RECAPITULATIF
        // ═════════════════════════════════════════════════════
        h1("Chapitre 7 : Recapitulatif et regles a retenir"),

        h2("7.1 Les 5 regles d'or"),
        bullet("num4", [bold("1. Le domaine ne depend de RIEN."), normal(" Aucun import de framework, librairie, ou annotation. Java pur uniquement.")]),
        bullet("num4", [bold("2. Les dependances vont de l'exterieur vers l'interieur."), normal(" Infrastructure -> Application -> Domaine. Jamais l'inverse.")]),
        bullet("num4", [bold("3. Chaque dependance externe passe par un port."), normal(" Base de donnees, tokens, hachage, envoi de mail — tout est abstrait derriere une interface du domaine.")]),
        bullet("num4", [bold("4. Les objets du domaine ne traversent pas les frontieres tels quels."), normal(" Les DTOs HTTP vivent dans le web. Les entites JPA vivent dans la persistance. Des mappers font le pont.")]),
        bullet("num4", [bold("5. Le domaine exprime ses erreurs."), normal(" Des exceptions metier custom, pas des IllegalArgumentException generiques.")]),
        spacer(),

        h2("7.2 Ou vit chaque chose ?"),
        new Table({
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Element", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Couche", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pourquoi", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
              ],
            }),
            ...[
              ["Utilisateur (POJO)", "Domaine", "Entite metier pure"],
              ["Role (enum)", "Domaine", "Concept metier"],
              ["RegisterCommand", "Domaine (port/in)", "Intention metier"],
              ["AuthResult", "Domaine (port/in)", "Resultat metier"],
              ["UtilisateurRepository", "Domaine (port/out)", "Contrat de persistance"],
              ["TokenProvider", "Domaine (port/out)", "Contrat de tokens"],
              ["PasswordHasher", "Domaine (port/out)", "Contrat de hachage"],
              ["EmailDejaUtiliseException", "Domaine (exception)", "Erreur metier"],
              ["AuthServiceImpl", "Application", "Orchestre les ports"],
              ["UtilisateurJpaEntity", "Infrastructure", "Mapping BDD"],
              ["JwtTokenAdapter", "Infrastructure", "Impl. de TokenProvider"],
              ["BcryptPasswordAdapter", "Infrastructure", "Impl. de PasswordHasher"],
              ["RegisterRequest (DTO)", "Infrastructure (web)", "Validation HTTP"],
              ["AuthController", "Infrastructure (web)", "Point d'entree REST"],
            ].map(([el, couche, pourquoi]) =>
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: el, font: "Courier New", size: 18 })] })] }),
                  new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: couche, font: "Arial", size: 20 })] })] }),
                  new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: pourquoi, font: "Arial", size: 20 })] })] }),
                ],
              })
            ),
          ],
        }),
        spacer(),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 8 : ADAPTERS DE SECURITE
        // ═════════════════════════════════════════════════════
        h1("Chapitre 8 : Les Adapters de securite en detail"),

        h2("8.1 JwtTokenAdapter — implementation de TokenProvider"),
        p("Le port TokenProvider definit dans le domaine ce dont on a besoin : generer des tokens et les valider. L'adapter JwtTokenAdapter implemente ce contrat avec la librairie JJWT (io.jsonwebtoken)."),
        spacer(),
        h3("Le port (domaine) :"),
        ...codeBlock([
          "public interface TokenProvider {",
          "    String generateToken(Utilisateur utilisateur);",
          "    String generateRefreshToken(Utilisateur utilisateur);",
          "    String extractUsername(String token);",
          "    boolean isTokenValid(String token, String username);",
          "}",
        ]),
        spacer(),
        h3("L'adapter (infrastructure) :"),
        ...codeBlock([
          "@Component",
          "public class JwtTokenAdapter implements TokenProvider {",
          "",
          "    private final JwtProperties jwtProperties;",
          "    private final SecretKey signingKey;",
          "",
          "    public JwtTokenAdapter(JwtProperties jwtProperties) {",
          "        this.jwtProperties = jwtProperties;",
          "        byte[] keyBytes = Decoders.BASE64.decode(",
          "            Base64.getEncoder().encodeToString(",
          "                jwtProperties.secret().getBytes()));",
          "        this.signingKey = Keys.hmacShaKeyFor(keyBytes);",
          "    }",
          "",
          "    @Override",
          "    public String generateToken(Utilisateur utilisateur) {",
          "        return buildToken(new HashMap<>(),",
          "            utilisateur.getEmail(),",
          "            jwtProperties.expirationMs());",
          "    }",
          "",
          "    @Override",
          "    public boolean isTokenValid(",
          "            String token, String username) {",
          "        return extractUsername(token)",
          "            .equals(username)",
          "            && !isTokenExpired(token);",
          "    }",
          "    // ...",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Difference cle avec l'ancien JwtService",
          "L'ancien JwtService prenait un UserDetails (Spring Security) en parametre. Le nouveau JwtTokenAdapter prend un Utilisateur (domaine). Le port est defini par le domaine, pas par Spring. Si demain on remplace JWT par Paseto ou un autre systeme de tokens, on cree un nouveau PasetoTokenAdapter sans toucher au domaine."
        ),

        h2("8.2 BcryptPasswordAdapter — implementation de PasswordHasher"),
        p("Le port PasswordHasher definit deux operations : hasher et verifier. L'adapter utilise BCrypt (via Spring Security)."),
        ...codeBlock([
          "@Component",
          "public class BcryptPasswordAdapter",
          "        implements PasswordHasher {",
          "",
          "    private final PasswordEncoder encoder =",
          "        new BCryptPasswordEncoder();",
          "",
          "    @Override",
          "    public String hash(String rawPassword) {",
          "        return encoder.encode(rawPassword);",
          "    }",
          "",
          "    @Override",
          "    public boolean matches(",
          "            String rawPassword,",
          "            String hashedPassword) {",
          "        return encoder.matches(",
          "            rawPassword, hashedPassword);",
          "    }",
          "}",
        ]),
        spacer(),
        ...warnBox(
          "Double role du PasswordEncoder",
          "Spring Security a besoin d'un bean PasswordEncoder pour le DaoAuthenticationProvider (login). BcryptPasswordAdapter implemente PasswordHasher (port domaine), pas PasswordEncoder (Spring). Le bean PasswordEncoder est donc declare separement dans SecurityConfig. Ce sont deux preoccupations differentes : le domaine hache les mots de passe, Spring Security verifie les credentials."
        ),

        h2("8.3 DtfUserDetails et DtfUserDetailsService"),
        p("Ces classes sont 100% infrastructure. Elles font le pont entre Spring Security et la couche persistance JPA."),
        spacer(),
        h3("AVANT (couplee au domaine) :"),
        ...codeBlock([
          "// MAUVAIS - import du domaine",
          "public class DtfUserDetails implements UserDetails {",
          "    public DtfUserDetails(Utilisateur utilisateur) {",
          "        // construit depuis l'entite domaine",
          "    }",
          "}",
        ]),
        spacer(),
        h3("APRES (reste dans l'infrastructure) :"),
        ...codeBlock([
          "// BON - import de l'entite JPA",
          "public class DtfUserDetails implements UserDetails {",
          "    public DtfUserDetails(",
          "            UtilisateurJpaEntity entity) {",
          "        this.id = entity.getId();",
          "        this.email = entity.getEmail();",
          "        this.password = entity.getPasswordHash();",
          "        this.username = entity.getUsername();",
          "        this.authorities = List.of(",
          "            new SimpleGrantedAuthority(",
          "                \"ROLE_\" + entity.getRole().name()));",
          "    }",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Pourquoi UtilisateurJpaEntity et pas Utilisateur ?",
          "UserDetails est un concept Spring Security. Le UserDetailsService charge depuis la base de donnees. Il est logique qu'il travaille avec l'entite JPA (meme couche). Le domaine n'a pas besoin de savoir que Spring Security existe."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 9 : COUCHE WEB
        // ═════════════════════════════════════════════════════
        h1("Chapitre 9 : La couche Web — Controller, DTOs et Mappers"),

        h2("9.1 Les DTOs HTTP"),
        p("Les DTOs vivent dans infrastructure/web/dto/. Ils gerent la serialisation JSON et la validation HTTP. Ils ne sont PAS des objets du domaine."),
        spacer(),

        new Table({
          columnWidths: [2400, 3200, 3760],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DTO", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Role", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3760, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Annotations", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
              ],
            }),
            ...[
              ["RegisterRequest", "Entree : inscription", "@NotBlank, @Email, @Size"],
              ["LoginRequest", "Entree : connexion", "@NotBlank, @Email"],
              ["AuthResponse", "Sortie : token + user", "Aucune (record pur)"],
              ["UtilisateurDto", "Sortie : infos user", "Methode from(Utilisateur)"],
              ["ErrorResponse", "Sortie : erreurs", "message + timestamp"],
            ].map(([dto, role, annot]) =>
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, width: { size: 2400, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: dto, font: "Courier New", size: 18 })] })] }),
                  new TableCell({ borders: cellBorders, width: { size: 3200, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: role, font: "Arial", size: 20 })] })] }),
                  new TableCell({ borders: cellBorders, width: { size: 3760, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: annot, font: "Arial", size: 20 })] })] }),
                ],
              })
            ),
          ],
        }),
        spacer(),

        h2("9.2 Le Mapper Web"),
        p("AuthWebMapper convertit les DTOs HTTP en commandes domaine et vice-versa :"),
        ...codeBlock([
          "public final class AuthWebMapper {",
          "    private AuthWebMapper() {}",
          "",
          "    public static RegisterCommand toCommand(",
          "            RegisterRequest req) {",
          "        return new RegisterCommand(",
          "            req.email(),",
          "            req.username(),",
          "            req.motDePasse());",
          "    }",
          "",
          "    public static AuthResponse toResponse(",
          "            AuthResult result) {",
          "        return new AuthResponse(",
          "            result.token(),",
          "            result.refreshToken(),",
          "            UtilisateurDto.from(",
          "                result.utilisateur()));",
          "    }",
          "}",
        ]),
        spacer(),

        h2("9.3 Le Controller"),
        p("Le controller depend du port entrant RegisterUseCase, pas de l'implementation AuthServiceImpl. Il utilise le mapper web pour convertir :"),
        ...codeBlock([
          "@RestController",
          "@RequestMapping(\"/auth\")",
          "public class AuthController {",
          "    private final RegisterUseCase registerUseCase;",
          "",
          "    @PostMapping(\"/register\")",
          "    public ResponseEntity<AuthResponse> register(",
          "            @Valid @RequestBody RegisterRequest req) {",
          "        RegisterCommand command =",
          "            AuthWebMapper.toCommand(req);",
          "        AuthResult result =",
          "            registerUseCase.register(command);",
          "        return ResponseEntity",
          "            .status(HttpStatus.CREATED)",
          "            .body(AuthWebMapper.toResponse(result));",
          "    }",
          "}",
        ]),
        spacer(),
        ...tipBox(
          "Le flux de donnees complet",
          "RegisterRequest (DTO HTTP) -> AuthWebMapper.toCommand() -> RegisterCommand (domaine) -> RegisterUseCase.register() -> AuthResult (domaine) -> AuthWebMapper.toResponse() -> AuthResponse (DTO HTTP). Chaque frontiere a son propre objet et son mapper. Le domaine ne voit jamais un DTO HTTP."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 10 : EXPLIQUE COMME A UN ENFANT
        // ═════════════════════════════════════════════════════
        h1("Chapitre 10 : L'architecture hexagonale expliquee simplement"),

        h2("10.1 L'histoire du restaurant"),
        p("Imagine un restaurant. Il y a trois zones :"),
        spacer(),
        p([bold("La cuisine (le Domaine)"), normal(" — C'est le coeur du restaurant. Le chef sait faire des plats. Il ne sait pas comment les clients commandent (par telephone ? sur place ? en ligne ?). Il ne sait pas non plus d'ou viennent les ingredients (supermarche ? ferme ? importation ?). Il sait juste : \"donne-moi des ingredients, je te fais un plat\".")]),
        spacer(),
        p([bold("Le serveur (l'Application)"), normal(" — Il prend la commande du client et la transmet au chef dans un langage que le chef comprend. Si le client dit \"je veux un Big Mac\", le serveur traduit en \"un steak hache, du pain, de la sauce\". Le serveur orchestre : il va chercher les ingredients, les donne au chef, recupere le plat, et le rapporte au client.")]),
        spacer(),
        p([bold("La salle et les fournisseurs (l'Infrastructure)"), normal(" — La salle, c'est le controller REST : c'est par la que les clients entrent. Les fournisseurs, ce sont les adapters : l'un livre la viande (JPA pour la base de donnees), l'autre le pain (JWT pour les tokens), un autre le sel (BCrypt pour les mots de passe).")]),
        spacer(),

        ...tipBox(
          "La regle magique",
          "Le chef ne sort JAMAIS de sa cuisine. Il ne va pas au supermarche. Il ne sert pas les clients. Il cuisine. Point. Si tu veux changer de fournisseur de viande, le chef s'en fiche — il recoit toujours de la viande, peu importe d'ou elle vient."
        ),

        h2("10.2 Les ports, c'est quoi ?"),
        p("Les ports, c'est le menu du restaurant et la liste de courses."),
        spacer(),
        p([bold("Le menu (Port Entrant)"), normal(" = ce que le restaurant SAIT FAIRE. \"Je sais inscrire un utilisateur\" (RegisterUseCase). Le client (controller) lit le menu et commande. Il ne sait pas comment c'est prepare.")]),
        spacer(),
        p([bold("La liste de courses (Port Sortant)"), normal(" = ce dont le chef A BESOIN. \"J'ai besoin de sauvegarder des utilisateurs\" (UtilisateurRepository), \"j'ai besoin de hasher des mots de passe\" (PasswordHasher). Le chef ne sait pas qui livre — il sait juste qu'il recoit ce qu'il a demande.")]),
        spacer(),

        h2("10.3 Les adapters, c'est quoi ?"),
        p("Les adapters, ce sont les livreurs qui remplissent la liste de courses :"),
        spacer(),
        bullet("bullets3", [bold("UtilisateurRepositoryAdapter"), normal(" = le livreur qui va chez PostgreSQL chercher et stocker les utilisateurs")]),
        bullet("bullets3", [bold("JwtTokenAdapter"), normal(" = le livreur qui fabrique des badges d'identite (tokens JWT)")]),
        bullet("bullets3", [bold("BcryptPasswordAdapter"), normal(" = le livreur qui transforme les mots de passe en codes secrets (hachage)")]),
        spacer(),
        p("Si demain tu veux changer PostgreSQL pour MongoDB, tu changes juste de livreur. Le chef (domaine) ne voit meme pas la difference."),
        spacer(),

        h2("10.4 Les mappers, c'est quoi ?"),
        p("Imagine que le chef parle francais et le fournisseur parle anglais. Le mapper, c'est le traducteur."),
        spacer(),
        p([bold("UtilisateurMapper"), normal(" traduit entre l'Utilisateur du chef (domaine, en francais) et l'UtilisateurJpaEntity du fournisseur (JPA, en \"langage base de donnees\").")]),
        spacer(),
        p([bold("AuthWebMapper"), normal(" traduit entre le RegisterRequest du client (\"je veux m'inscrire avec cet email\") et le RegisterCommand du chef (\"inscris cet email\"). Meme information, langages differents.")]),
        spacer(),

        h2("10.5 Resume en une phrase"),
        p([bold("L'architecture hexagonale, c'est un chef qui cuisine sans jamais sortir de sa cuisine, grace a des menus (ports) et des livreurs (adapters) qui s'occupent de tout le reste.")]),
        spacer(),

        ...warnBox(
          "Pourquoi c'est important ?",
          "Parce que si le chef doit aussi faire les courses, servir les clients, et reparer la caisse, il ne peut plus cuisiner correctement. En separant les responsabilites, chaque partie fait bien son travail, et on peut changer une partie sans casser les autres."
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ═════════════════════════════════════════════════════
        // CHAPITRE 11 : EVALUATION FINALE
        // ═════════════════════════════════════════════════════
        h1("Chapitre 11 : Evaluation finale du projet"),

        h2("11.1 Grille de notation"),
        new Table({
          columnWidths: [3500, 1500, 4360],
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Critere", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Note", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4360, type: WidthType.DXA }, shading: { fill: COLORS.primary, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Detail", bold: true, color: COLORS.white, font: "Arial", size: 20 })] })] }),
              ],
            }),
            ...[
              ["Purete du domaine", "10/10", "10 fichiers, zero import framework"],
              ["Inversion de dependance", "10/10", "Services dependent des ports, jamais des implem."],
              ["Ports entrants", "9/10", "RegisterUseCase OK, LoginUseCase a venir"],
              ["Ports sortants", "10/10", "3 ports avec adapters interchangeables"],
              ["Separation domaine / JPA", "10/10", "Utilisateur (pur) vs UtilisateurJpaEntity"],
              ["DTOs au bon endroit", "10/10", "Dans infrastructure/web/dto/ avec mappers"],
              ["Organisation des packages", "9/10", "Structure claire et coherente"],
              ["Config et securite", "8/10", "Secret JWT en dur (acceptable en dev)"],
              ["Tests", "6/10", "Architecture testable mais tests non ecrits"],
              ["NOTE GLOBALE", "9/10", "Architecture hexagonale solide et fonctionnelle"],
            ].map(([critere, note, detail]) =>
              new TableRow({
                children: [
                  new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: critere, font: "Arial", size: 20, bold: critere === "NOTE GLOBALE" })] })] }),
                  new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, shading: { fill: critere === "NOTE GLOBALE" ? COLORS.bgTip : "FFFFFF", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: note, font: "Arial", size: 20, bold: true, color: critere === "NOTE GLOBALE" ? "1A8870" : COLORS.dark })] })] }),
                  new TableCell({ borders: cellBorders, width: { size: 4360, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: detail, font: "Arial", size: 20 })] })] }),
                ],
              })
            ),
          ],
        }),
        spacer(),

        h2("11.2 Prochaines etapes"),
        p("Pour atteindre le 10/10 :"),
        bullet("bullets4", "Ecrire les tests unitaires du domaine (AuthServiceImpl avec mocks des ports)"),
        bullet("bullets4", "Implementer LoginUseCase (port entrant pour la connexion)"),
        bullet("bullets4", "Externaliser le secret JWT (variable d'environnement)"),
        bullet("bullets4", "Ajouter le bounded context fichiers (upload, liens temporaires, chiffrement)"),
        spacer(),

        h2("11.3 Structure finale du projet"),
        ...codeBlock([
          "com.bomunto.fileshared/",
          "|-- FilesharedApplication.java",
          "|",
          "|-- domaine/identity/              <- 10 fichiers, 0 framework",
          "|   |-- EntityAbstract.java",
          "|   |-- Utilisateur.java",
          "|   |-- Role.java",
          "|   |-- port/in/",
          "|   |   |-- RegisterUseCase.java",
          "|   |   |-- RegisterCommand.java",
          "|   |   |-- AuthResult.java",
          "|   |-- port/out/",
          "|   |   |-- UtilisateurRepository.java",
          "|   |   |-- TokenProvider.java",
          "|   |   |-- PasswordHasher.java",
          "|   |-- exception/",
          "|       |-- EmailDejaUtiliseException.java",
          "|",
          "|-- application/identity/           <- 1 fichier",
          "|   |-- service/",
          "|       |-- AuthServiceImpl.java",
          "|",
          "|-- infrastructure/                 <- 26 fichiers",
          "    |-- persistence/",
          "    |   |-- entity/",
          "    |   |   |-- JpaEntityAbstract.java",
          "    |   |   |-- UtilisateurJpaEntity.java",
          "    |   |-- mapper/UtilisateurMapper.java",
          "    |   |-- jpa/JpaUtilisateurRepository.java",
          "    |   |-- adapter/UtilisateurRepositoryAdapter.java",
          "    |-- security/",
          "    |   |-- adapter/",
          "    |   |   |-- JwtTokenAdapter.java",
          "    |   |   |-- BcryptPasswordAdapter.java",
          "    |   |-- DtfUserDetails.java",
          "    |   |-- DtfUserDetailsService.java",
          "    |   |-- JwtAuthenticationFilter.java",
          "    |-- web/",
          "    |   |-- controller/AuthController.java",
          "    |   |-- dto/",
          "    |   |   |-- RegisterRequest.java",
          "    |   |   |-- LoginRequest.java",
          "    |   |   |-- AuthResponse.java",
          "    |   |   |-- UtilisateurDto.java",
          "    |   |   |-- ErrorResponse.java",
          "    |   |-- mapper/AuthWebMapper.java",
          "    |-- config/",
          "        |-- SecurityConfig.java",
          "        |-- CorsConfig.java",
          "        |-- CorsProperties.java",
          "        |-- JwtProperties.java",
          "        |-- AppConfig.java",
          "        |-- OpenApiConfig.java",
          "        |-- DataInitializer.java",
        ]),
      ],
    },
  ],
});

// ── Generate ────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  const outPath = __dirname + "/cours-architecture-hexagonale-ddd.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Document genere : " + outPath);
});
