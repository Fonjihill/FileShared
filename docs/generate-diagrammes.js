const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat } = require('docx');

// === STYLES ===
const COLORS = {
    primary: "1B4F72",
    secondary: "2E86C1",
    accent: "27AE60",
    dark: "2C3E50",
    light: "ECF0F1",
    white: "FFFFFF",
    enum: "8E44AD",
    port: "E67E22",
    exception: "C0392B",
    record: "16A085"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "BDC3C7" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
const noBorders = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 }
};

// === HELPERS ===
function title(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text, bold: true, size: 32, color: COLORS.primary, font: "Arial" })]
    });
}

function subtitle(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text, bold: true, size: 26, color: COLORS.secondary, font: "Arial" })]
    });
}

function subsubtitle(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text, bold: true, size: 22, color: COLORS.dark, font: "Arial" })]
    });
}

function text(t, opts = {}) {
    return new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: t, size: 20, font: "Arial", ...opts })]
    });
}

function emptyLine() {
    return new Paragraph({ spacing: { after: 100 }, children: [] });
}

// Class diagram as a table
function classBox(stereotype, name, attributes, methods, color) {
    const headerShading = { fill: color, type: ShadingType.CLEAR };
    const bodyShading = { fill: COLORS.white, type: ShadingType.CLEAR };

    const rows = [];

    // Stereotype + Name header
    const headerChildren = [];
    if (stereotype) {
        headerChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `<<${stereotype}>>`, italics: true, size: 16, color: COLORS.white, font: "Courier New" })]
        }));
    }
    headerChildren.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: name, bold: true, size: 22, color: COLORS.white, font: "Courier New" })]
    }));

    rows.push(new TableRow({
        children: [new TableCell({
            borders: cellBorders,
            shading: headerShading,
            width: { size: 9360, type: WidthType.DXA },
            children: headerChildren
        })]
    }));

    // Attributes
    if (attributes && attributes.length > 0) {
        const attrParagraphs = attributes.map(a =>
            new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: a, size: 17, font: "Courier New", color: COLORS.dark })]
            })
        );
        rows.push(new TableRow({
            children: [new TableCell({
                borders: cellBorders,
                shading: bodyShading,
                width: { size: 9360, type: WidthType.DXA },
                children: attrParagraphs
            })]
        }));
    }

    // Methods
    if (methods && methods.length > 0) {
        const methodParagraphs = methods.map(m =>
            new Paragraph({
                spacing: { after: 40 },
                children: [new TextRun({ text: m, size: 17, font: "Courier New", color: COLORS.dark })]
            })
        );
        rows.push(new TableRow({
            children: [new TableCell({
                borders: cellBorders,
                shading: bodyShading,
                width: { size: 9360, type: WidthType.DXA },
                children: methodParagraphs
            })]
        }));
    }

    return new Table({
        columnWidths: [9360],
        rows
    });
}

// Two-column layout for side-by-side classes
function twoColumnClasses(left, right) {
    return new Table({
        columnWidths: [4580, 4580],
        rows: [new TableRow({
            children: [
                new TableCell({
                    borders: noBorders,
                    width: { size: 4580, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.TOP,
                    children: [left]
                }),
                new TableCell({
                    borders: noBorders,
                    width: { size: 4580, type: WidthType.DXA },
                    verticalAlign: VerticalAlign.TOP,
                    children: [right]
                })
            ]
        })]
    });
}

// Relation arrow text
function relation(from, to, type, label) {
    const arrows = { extends: "───▷", implements: "- - ▷", uses: "───>", "1..*": "1───*" };
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [
            new TextRun({ text: `${from}  `, size: 18, font: "Courier New", bold: true, color: COLORS.dark }),
            new TextRun({ text: arrows[type] || "───>", size: 18, font: "Courier New", color: COLORS.secondary }),
            new TextRun({ text: `  ${to}`, size: 18, font: "Courier New", bold: true, color: COLORS.dark }),
            new TextRun({ text: `    [${label}]`, size: 16, font: "Arial", italics: true, color: "7F8C8D" })
        ]
    });
}

// === BUILD DOCUMENT ===
const doc = new Document({
    styles: {
        default: { document: { run: { font: "Arial", size: 20 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 32, bold: true, color: COLORS.primary, font: "Arial" },
                paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 26, bold: true, color: COLORS.secondary, font: "Arial" },
                paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 22, bold: true, color: COLORS.dark, font: "Arial" },
                paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
        ]
    },
    numbering: {
        config: [
            { reference: "bullet-list",
                levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
                    style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
        ]
    },
    sections: [
        // === PAGE DE TITRE ===
        {
            properties: {
                page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
            },
            headers: {
                default: new Header({ children: [new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: "FileShared - Diagrammes de classes", size: 16, color: "999999", font: "Arial" })]
                })] })
            },
            footers: {
                default: new Footer({ children: [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: "Page ", size: 16, font: "Arial" }),
                        new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial" }),
                        new TextRun({ text: " / ", size: 16, font: "Arial" }),
                        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: "Arial" })
                    ]
                })] })
            },
            children: [
                emptyLine(), emptyLine(), emptyLine(), emptyLine(),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [new TextRun({ text: "FileShared", bold: true, size: 56, color: COLORS.primary, font: "Arial" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [new TextRun({ text: "Diagrammes de Classes UML", size: 36, color: COLORS.secondary, font: "Arial" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [new TextRun({ text: "Bounded Context : filesharing", size: 24, color: COLORS.dark, font: "Arial", italics: true })]
                }),
                emptyLine(),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Architecture Hexagonale - Domaine Pur", size: 22, color: "7F8C8D", font: "Arial" })]
                }),
                emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Bomunto - Mars 2026", size: 20, color: "999999", font: "Arial" })]
                }),

                // === PAGE 2 : ENTITES ===
                new Paragraph({ children: [new PageBreak()] }),

                title("1. Entites du Domaine"),
                text("Les entites sont des objets metier avec une identite unique. Elles heritent toutes de EntityAbstract pour les champs d'audit (createdAt, updatedAt)."),
                emptyLine(),

                // EntityAbstract
                subsubtitle("1.1 EntityAbstract (classe abstraite partagee)"),
                classBox("abstract", "EntityAbstract",
                    ["- createdAt : Instant", "- updatedAt : Instant"],
                    ["+ getCreatedAt() : Instant", "+ getUpdatedAt() : Instant"],
                    COLORS.dark
                ),
                emptyLine(),

                // Fichier
                subsubtitle("1.2 Fichier"),
                text("Entite principale du bounded context. Represente un fichier uploade par un utilisateur."),
                classBox(null, "Fichier extends EntityAbstract",
                    [
                        "- id : UUID",
                        "- nom : String",
                        "- nomOriginal : String",
                        "- taille : long",
                        "- typeMime : String",
                        "- cheminStockage : String",
                        "- proprietaireId : UUID",
                        "- statut : StatutFichier"
                    ],
                    [
                        "+ estActif() : boolean",
                        "+ estSupprime() : boolean"
                    ],
                    COLORS.primary
                ),
                emptyLine(),

                // LienPartage
                subsubtitle("1.3 LienPartage"),
                text("Represente un lien public de partage avec un token unique, une permission et une date d'expiration optionnelle."),
                classBox(null, "LienPartage extends EntityAbstract",
                    [
                        "- id : UUID",
                        "- fichierId : UUID",
                        "- token : String",
                        "- permission : Permission",
                        "- expiration : Instant",
                        "- actif : boolean",
                        "- createurId : UUID"
                    ],
                    [
                        "+ estExpire() : boolean",
                        "+ estValide() : boolean",
                        "+ desactiver() : void"
                    ],
                    COLORS.primary
                ),
                emptyLine(),

                // PartageUtilisateur
                subsubtitle("1.4 PartageUtilisateur"),
                text("Partage d'un fichier avec un utilisateur specifique (partage prive)."),
                classBox(null, "PartageUtilisateur extends EntityAbstract",
                    [
                        "- id : UUID",
                        "- fichierId : UUID",
                        "- destinataireId : UUID",
                        "- permission : Permission"
                    ],
                    [],
                    COLORS.primary
                ),
                emptyLine(),

                // === PAGE 3 : ENUMS ===
                new Paragraph({ children: [new PageBreak()] }),

                title("2. Enumerations"),
                text("Les enums definissent les valeurs possibles pour les statuts et permissions."),
                emptyLine(),

                twoColumnClasses(
                    classBox("enum", "StatutFichier",
                        ["ACTIF", "SUPPRIME"],
                        [],
                        COLORS.enum
                    ),
                    classBox("enum", "Permission",
                        ["LECTURE", "TELECHARGEMENT"],
                        [],
                        COLORS.enum
                    )
                ),
                emptyLine(),

                // === RELATIONS ===
                title("3. Relations entre Entites"),
                emptyLine(),
                relation("Fichier", "EntityAbstract", "extends", "heritage"),
                relation("LienPartage", "EntityAbstract", "extends", "heritage"),
                relation("PartageUtilisateur", "EntityAbstract", "extends", "heritage"),
                relation("Fichier", "StatutFichier", "uses", "statut"),
                relation("Fichier", "LienPartage", "1..*", "un fichier a N liens"),
                relation("Fichier", "PartageUtilisateur", "1..*", "un fichier a N partages"),
                relation("LienPartage", "Permission", "uses", "permission"),
                relation("PartageUtilisateur", "Permission", "uses", "permission"),
                emptyLine(),

                // === PAGE 4 : PORTS ENTRANTS ===
                new Paragraph({ children: [new PageBreak()] }),

                title("4. Ports Entrants (Use Cases)"),
                text("Les ports entrants definissent les operations metier exposees au monde exterieur. Ils sont implementes par les services applicatifs."),
                emptyLine(),

                subsubtitle("4.1 UploadFichierUseCase"),
                classBox("interface", "UploadFichierUseCase",
                    [],
                    ["+ upload(cmd: UploadFichierCommand) : FichierResult"],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("4.2 TelechargerFichierUseCase"),
                classBox("interface", "TelechargerFichierUseCase",
                    [],
                    [
                        "+ telecharger(cmd: TelechargerCommand) : FichierContenu",
                        "+ telechargerParToken(token: String) : FichierContenu"
                    ],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("4.3 ListerFichiersUseCase"),
                classBox("interface", "ListerFichiersUseCase",
                    [],
                    [
                        "+ listerMesFichiers(proprietaireId: UUID) : List<Fichier>",
                        "+ listerPartagesAvecMoi(userId: UUID) : List<Fichier>"
                    ],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("4.4 PartagerFichierUseCase"),
                classBox("interface", "PartagerFichierUseCase",
                    [],
                    [
                        "+ partagerParLien(cmd: CreerLienCommand) : LienPartage",
                        "+ partagerAvecUtilisateur(cmd: PartagerCommand) : void",
                        "+ revoquerPartage(partageId: UUID, userId: UUID) : void"
                    ],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("4.5 SupprimerFichierUseCase"),
                classBox("interface", "SupprimerFichierUseCase",
                    [],
                    ["+ supprimer(fichierId: UUID, userId: UUID) : void"],
                    COLORS.port
                ),

                // === PAGE 5 : COMMANDS & RESULTS ===
                new Paragraph({ children: [new PageBreak()] }),

                title("5. Commands et Results"),
                text("Les records Java transportent les donnees entre les couches. Les Commands entrent dans le domaine, les Results en sortent."),
                emptyLine(),

                subsubtitle("5.1 Commands (entree)"),
                emptyLine(),
                classBox("record", "UploadFichierCommand",
                    [
                        "+ nom : String",
                        "+ typeMime : String",
                        "+ taille : long",
                        "+ contenu : InputStream",
                        "+ proprietaireId : UUID"
                    ],
                    [],
                    COLORS.record
                ),
                emptyLine(),

                twoColumnClasses(
                    classBox("record", "TelechargerCommand",
                        ["+ fichierId : UUID", "+ utilisateurId : UUID"],
                        [],
                        COLORS.record
                    ),
                    classBox("record", "CreerLienCommand",
                        [
                            "+ fichierId : UUID",
                            "+ proprietaireId : UUID",
                            "+ permission : Permission",
                            "+ expiration : Instant"
                        ],
                        [],
                        COLORS.record
                    )
                ),
                emptyLine(),

                classBox("record", "PartagerCommand",
                    [
                        "+ fichierId : UUID",
                        "+ proprietaireId : UUID",
                        "+ destinataireId : UUID",
                        "+ permission : Permission"
                    ],
                    [],
                    COLORS.record
                ),
                emptyLine(),

                subsubtitle("5.2 Results (sortie)"),
                emptyLine(),

                twoColumnClasses(
                    classBox("record", "FichierResult",
                        ["+ fichier : Fichier"],
                        [],
                        COLORS.record
                    ),
                    classBox("record", "FichierContenu",
                        [
                            "+ nom : String",
                            "+ typeMime : String",
                            "+ contenu : InputStream"
                        ],
                        [],
                        COLORS.record
                    )
                ),

                // === PAGE 6 : PORTS SORTANTS ===
                new Paragraph({ children: [new PageBreak()] }),

                title("6. Ports Sortants"),
                text("Les ports sortants sont des interfaces que le domaine utilise pour acceder aux ressources externes (base de donnees, stockage fichiers). Implementes par des adapters dans l'infrastructure."),
                emptyLine(),

                subsubtitle("6.1 FichierRepository"),
                classBox("interface", "FichierRepository",
                    [],
                    [
                        "+ save(fichier: Fichier) : Fichier",
                        "+ findById(id: UUID) : Optional<Fichier>",
                        "+ findByProprietaireId(id: UUID) : List<Fichier>",
                        "+ delete(id: UUID) : void"
                    ],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("6.2 FileStorage"),
                text("Port cle qui abstrait le stockage physique. En dev : LocalFileStorageAdapter. En prod : S3 ou Firebase."),
                classBox("interface", "FileStorage",
                    [],
                    [
                        "+ stocker(nom: String, contenu: InputStream) : String",
                        "+ recuperer(chemin: String) : InputStream",
                        "+ supprimer(chemin: String) : void"
                    ],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("6.3 LienPartageRepository"),
                classBox("interface", "LienPartageRepository",
                    [],
                    [
                        "+ save(lien: LienPartage) : LienPartage",
                        "+ findByToken(token: String) : Optional<LienPartage>",
                        "+ findByFichierId(id: UUID) : List<LienPartage>",
                        "+ delete(id: UUID) : void"
                    ],
                    COLORS.port
                ),
                emptyLine(),

                subsubtitle("6.4 PartageUtilisateurRepository"),
                classBox("interface", "PartageUtilisateurRepository",
                    [],
                    [
                        "+ save(p: PartageUtilisateur) : PartageUtilisateur",
                        "+ findByDestinataire(userId: UUID) : List<PartageUtilisateur>",
                        "+ findByFichierId(id: UUID) : List<PartageUtilisateur>",
                        "+ delete(id: UUID) : void"
                    ],
                    COLORS.port
                ),

                // === PAGE 7 : EXCEPTIONS ===
                new Paragraph({ children: [new PageBreak()] }),

                title("7. Exceptions Domaine"),
                text("Les exceptions metier sont levees par le domaine et capturees par le GlobalExceptionHandler dans l'infrastructure web."),
                emptyLine(),

                classBox("exception", "FichierIntrouvableException",
                    ["message: \"Fichier {id} introuvable\""],
                    [],
                    COLORS.exception
                ),
                text("    HTTP 404 Not Found", { italics: true, color: "7F8C8D" }),
                emptyLine(),

                classBox("exception", "AccesRefuseException",
                    ["message: \"Acces refuse a ce fichier\""],
                    [],
                    COLORS.exception
                ),
                text("    HTTP 403 Forbidden", { italics: true, color: "7F8C8D" }),
                emptyLine(),

                classBox("exception", "LienExpireException",
                    ["message: \"Ce lien de partage a expire\""],
                    [],
                    COLORS.exception
                ),
                text("    HTTP 410 Gone", { italics: true, color: "7F8C8D" }),
                emptyLine(),

                // === LEGENDE ===
                title("8. Legende des couleurs"),
                emptyLine(),

                new Table({
                    columnWidths: [2000, 7360],
                    rows: [
                        ["Entite", COLORS.primary],
                        ["Enum", COLORS.enum],
                        ["Interface (Port)", COLORS.port],
                        ["Record (Command/Result)", COLORS.record],
                        ["Exception", COLORS.exception]
                    ].map(([label, color]) =>
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders: cellBorders,
                                    shading: { fill: color, type: ShadingType.CLEAR },
                                    width: { size: 2000, type: WidthType.DXA },
                                    children: [new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: "    ", size: 18 })]
                                    })]
                                }),
                                new TableCell({
                                    borders: cellBorders,
                                    width: { size: 7360, type: WidthType.DXA },
                                    children: [new Paragraph({
                                        children: [new TextRun({ text: label, size: 20, font: "Arial", color: COLORS.dark })]
                                    })]
                                })
                            ]
                        })
                    )
                })
            ]
        }
    ]
});

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("/Users/mistert/Bomunto/02_Projets_Internes/fileshared/docs/diagrammes-classes-filesharing.docx", buffer);
    console.log("Document genere : docs/diagrammes-classes-filesharing.docx");
});
