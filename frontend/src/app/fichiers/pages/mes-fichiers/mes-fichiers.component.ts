import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FichierService } from '../../services/fichier.service';
import { FichierDto, LienPartageDto, PreviewData } from '../../models/fichier.models';
import { AuthService } from '../../../auth/services/auth.service';
import { UtilisateurDto } from '../../../auth/models/auth.models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-mes-fichiers',
  templateUrl: './mes-fichiers.component.html',
  styleUrls: ['./mes-fichiers.component.scss']
})
export class MesFichiersComponent implements OnInit {

  fichiers: FichierDto[] = [];
  chargement = false;

  // Upload progress
  uploadEnCours = false;
  uploadProgression = 0;
  uploadNomFichier = '';

  // Dialog partage
  dialogPartageVisible = false;
  fichierSelectionne: FichierDto | null = null;
  permissionPartage = 'LECTURE';
  expirationPartage = '';
  motDePassePartage = '';
  lienPartage = '';
  lienProtegeParMotDePasse = false;
  creationLienEnCours = false;

  // Partage avec utilisateur
  emailRecherche = '';
  utilisateurTrouve: UtilisateurDto | null = null;
  rechercheEnCours = false;
  partageUtilisateurEnCours = false;
  permissionPartageUtilisateur = 'LECTURE';

  // Drag & Drop
  isDragOver = false;

  // Preview
  previewVisible = false;
  previewData: PreviewData | null = null;
  previewImageUrl: string | null = null;
  previewPdfUrl: SafeResourceUrl | null = null;

  // Rename
  renommerVisible = false;
  fichierARenommer: FichierDto | null = null;
  nouveauNom = '';

  constructor(
    private fichierService: FichierService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.chargerFichiers();
  }

  chargerFichiers(): void {
    this.chargement = true;
    this.fichierService.lister().subscribe({
      next: (result) => {
        this.fichiers = result.contenu;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les fichiers' });
      }
    });
  }

  onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFichier(input.files[0]);
      input.value = '';
    }
  }

  uploadFichier(file: File): void {
    this.uploadEnCours = true;
    this.uploadProgression = 0;
    this.uploadNomFichier = file.name;

    const { progress$, result$ } = this.fichierService.uploadAvecProgression(file);

    progress$.subscribe({
      next: (percent) => this.uploadProgression = percent,
    });

    result$.subscribe({
      next: () => {
        this.uploadEnCours = false;
        this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Fichier envoye' });
        this.chargerFichiers();
      },
      error: () => {
        this.uploadEnCours = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Erreur lors de l'envoi" });
      }
    });
  }

  telecharger(fichier: FichierDto): void {
    this.fichierService.telecharger(fichier.id);
  }

  confirmerSuppression(fichier: FichierDto): void {
    this.confirmationService.confirm({
      message: `Supprimer "${fichier.nomOriginal}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.fichierService.supprimer(fichier.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Fichier supprime' });
            this.chargerFichiers();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression' });
          }
        });
      }
    });
  }

  ouvrirDialogPartage(fichier: FichierDto): void {
    this.fichierSelectionne = fichier;
    this.permissionPartage = 'LECTURE';
    this.expirationPartage = '';
    this.motDePassePartage = '';
    this.lienPartage = '';
    this.lienProtegeParMotDePasse = false;
    this.emailRecherche = '';
    this.utilisateurTrouve = null;
    this.permissionPartageUtilisateur = 'LECTURE';
    this.dialogPartageVisible = true;
  }

  creerLienPartage(): void {
    if (!this.fichierSelectionne) return;
    this.creationLienEnCours = true;
    const expiration = this.expirationPartage ? new Date(this.expirationPartage).toISOString() : undefined;
    const motDePasse = this.motDePassePartage || undefined;
    this.fichierService.creerLien(this.fichierSelectionne.id, this.permissionPartage, expiration, motDePasse).subscribe({
      next: (lien: LienPartageDto) => {
        this.lienPartage = `http://localhost:4200/partage/${lien.token}`;
        this.lienProtegeParMotDePasse = !!motDePasse;
        this.creationLienEnCours = false;
        this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Lien cree' });
      },
      error: () => {
        this.creationLienEnCours = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la creation du lien' });
      }
    });
  }

  copierLien(): void {
    navigator.clipboard.writeText(this.lienPartage).then(() => {
      this.messageService.add({ severity: 'info', summary: 'Copie', detail: 'Lien copie' });
    });
  }

  rechercherUtilisateur(): void {
    if (!this.emailRecherche.trim()) return;
    this.rechercheEnCours = true;
    this.utilisateurTrouve = null;
    this.authService.rechercherUtilisateur(this.emailRecherche.trim()).subscribe({
      next: (u) => { this.utilisateurTrouve = u; this.rechercheEnCours = false; },
      error: () => {
        this.rechercheEnCours = false;
        this.messageService.add({ severity: 'warn', summary: 'Non trouve', detail: 'Aucun utilisateur avec cet email' });
      }
    });
  }

  partagerAvecUtilisateur(): void {
    if (!this.fichierSelectionne || !this.utilisateurTrouve) return;
    this.partageUtilisateurEnCours = true;
    this.fichierService.partagerAvecUtilisateur(this.fichierSelectionne.id, this.utilisateurTrouve.id, this.permissionPartageUtilisateur).subscribe({
      next: () => {
        this.partageUtilisateurEnCours = false;
        this.messageService.add({ severity: 'success', summary: 'Succes', detail: `Partage avec ${this.utilisateurTrouve!.username}` });
        this.dialogPartageVisible = false;
      },
      error: () => {
        this.partageUtilisateurEnCours = false;
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du partage' });
      }
    });
  }

  getIconeFichier(typeMime: string): string {
    if (!typeMime) return 'pi pi-file';
    if (typeMime.startsWith('image/')) return 'pi pi-image';
    if (typeMime.startsWith('video/')) return 'pi pi-video';
    if (typeMime.includes('pdf')) return 'pi pi-file-pdf';
    if (typeMime.includes('word') || typeMime.includes('document')) return 'pi pi-file-word';
    if (typeMime.includes('sheet') || typeMime.includes('excel')) return 'pi pi-file-excel';
    return 'pi pi-file';
  }

  formatTaille(octets: number): string {
    if (octets === 0) return '0 o';
    const unites = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(octets) / Math.log(1024));
    return `${(octets / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${unites[i]}`;
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadFichier(event.dataTransfer.files[0]);
    }
  }

  // ── Preview ─────────────────────────────────────────────────────────────
  ouvrirPreview(fichier: FichierDto): void {
    if (this.estPreviewable(fichier.typeMime)) {
      this.fichierService.getPreviewUrl(fichier.id).subscribe(blob => {
        const url = URL.createObjectURL(blob);
        this.previewData = {
          nom: fichier.nomOriginal,
          typeMime: fichier.typeMime,
          url: url
        };
        this.previewImageUrl = fichier.typeMime.startsWith('image/') ? url : null;
        this.previewPdfUrl = fichier.typeMime === 'application/pdf'
          ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
          : null;
        this.previewVisible = true;
      });
    } else {
      this.telecharger(fichier);
    }
  }

  estPreviewable(typeMime: string): boolean {
    return typeMime?.startsWith('image/') || typeMime === 'application/pdf';
  }

  fermerPreview(): void {
    if (this.previewData?.url) {
      URL.revokeObjectURL(this.previewData.url);
    }
    this.previewData = null;
    this.previewImageUrl = null;
    this.previewPdfUrl = null;
    this.previewVisible = false;
  }

  // ── Rename ──────────────────────────────────────────────────────────────
  ouvrirRenommer(fichier: FichierDto): void {
    this.fichierARenommer = fichier;
    this.nouveauNom = fichier.nomOriginal;
    this.renommerVisible = true;
  }

  renommer(): void {
    if (!this.fichierARenommer || !this.nouveauNom.trim()) return;
    this.fichierService.renommer(this.fichierARenommer.id, this.nouveauNom.trim()).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Fichier renomme' });
        this.renommerVisible = false;
        this.chargerFichiers();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du renommage' });
      }
    });
  }
}
