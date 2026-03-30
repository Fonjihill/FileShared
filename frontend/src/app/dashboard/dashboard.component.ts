import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../auth/services/auth.service';
import { FichierService } from '../fichiers/services/fichier.service';
import { FichierDto, LienPartageDto, PreviewData } from '../fichiers/models/fichier.models';
import { UtilisateurDto } from '../auth/models/auth.models';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  utilisateur: UtilisateurDto | null = null;
  fichiers: FichierDto[] = [];
  chargement = false;

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

  // Options permissions
  permissionsOptions = [
    { label: 'Lecture seule', value: 'LECTURE' },
    { label: 'Telechargement', value: 'TELECHARGEMENT' }
  ];

  // Upload progress
  uploadEnCours = false;
  uploadProgression = 0;
  uploadNomFichier = '';

  // Quota
  quota: { utilise: number, maximum: number, disponible: number } | null = null;

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
    private authService: AuthService,
    private fichierService: FichierService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.chargerProfil();
    this.chargerFichiers();
    this.chargerQuota();
  }

  chargerQuota(): void {
    this.fichierService.getQuota().subscribe({
      next: (q) => this.quota = q
    });
  }

  // ── Computed stats ────────────────────────────────────────────────────────
  get totalFichiers(): number {
    return this.fichiers.length;
  }

  get totalTaille(): number {
    return this.fichiers.reduce((sum, f) => sum + f.taille, 0);
  }

  totalPartages = 0;

  // ── File icon helper ──────────────────────────────────────────────────────
  getIconeFichier(typeMime: string): string {
    if (!typeMime) return 'pi pi-file';
    if (typeMime.startsWith('image/')) return 'pi pi-image';
    if (typeMime.startsWith('video/')) return 'pi pi-video';
    if (typeMime.startsWith('audio/')) return 'pi pi-volume-up';
    if (typeMime.includes('pdf')) return 'pi pi-file-pdf';
    if (typeMime.includes('word') || typeMime.includes('document')) return 'pi pi-file-word';
    if (typeMime.includes('excel') || typeMime.includes('spreadsheet')) return 'pi pi-file-excel';
    if (typeMime.includes('zip') || typeMime.includes('archive') || typeMime.includes('compressed')) return 'pi pi-box';
    if (typeMime.includes('text/')) return 'pi pi-align-left';
    return 'pi pi-file';
  }

  getIconeCouleur(typeMime: string): string {
    if (!typeMime) return '#64748b';
    if (typeMime.startsWith('image/')) return '#8b5cf6';
    if (typeMime.startsWith('video/')) return '#ec4899';
    if (typeMime.startsWith('audio/')) return '#f59e0b';
    if (typeMime.includes('pdf')) return '#ef4444';
    if (typeMime.includes('word') || typeMime.includes('document')) return '#3b82f6';
    if (typeMime.includes('excel') || typeMime.includes('spreadsheet')) return '#10b981';
    if (typeMime.includes('zip') || typeMime.includes('archive')) return '#64748b';
    return '#64748b';
  }

  // ── Profile & Files ───────────────────────────────────────────────────────
  chargerProfil(): void {
    this.authService.getProfil().subscribe({
      next: (profil) => this.utilisateur = profil,
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger le profil'
      })
    });
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les fichiers'
        });
      }
    });
  }

  onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFichier(file);
      input.value = '';
    }
  }

  uploadFichier(file: File): void {
    // Vérification quota AVANT l'upload
    if (this.quota) {
      if (file.size > this.quota.disponible) {
        const dispo = this.formatTaille(this.quota.disponible);
        const tailleFichier = this.formatTaille(file.size);
        const max = this.formatTaille(this.quota.maximum);

        if (this.quota.disponible <= 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Stockage plein',
            detail: `Votre espace de ${max} est entierement utilise. Supprimez des fichiers pour liberer de l'espace.`,
            life: 8000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Fichier trop volumineux',
            detail: `Ce fichier fait ${tailleFichier} mais il ne vous reste que ${dispo} disponible sur ${max}.`,
            life: 8000
          });
        }
        return;
      }

      // Vérification taille max par fichier (100 Mo)
      const MAX_FILE_SIZE = 100 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Fichier trop volumineux',
          detail: `La taille maximale par fichier est de 100 Mo. Votre fichier fait ${this.formatTaille(file.size)}.`,
          life: 8000
        });
        return;
      }
    }

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
        this.uploadProgression = 0;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Fichier envoye avec succes'
        });
        this.chargerFichiers();
        this.chargerQuota();
      },
      error: () => {
        this.uploadEnCours = false;
        this.uploadProgression = 0;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Erreur lors de l'envoi du fichier"
        });
      }
    });
  }

  telecharger(fichier: FichierDto): void {
    this.fichierService.telecharger(fichier.id);
  }

  confirmerSuppression(fichier: FichierDto): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer "${fichier.nomOriginal}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.fichierService.supprimer(fichier.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succes',
              detail: 'Fichier supprime'
            });
            this.chargerFichiers();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la suppression'
            });
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
    const expiration = this.expirationPartage
      ? new Date(this.expirationPartage).toISOString()
      : undefined;
    const motDePasse = this.motDePassePartage || undefined;
    this.fichierService.creerLien(
      this.fichierSelectionne.id,
      this.permissionPartage,
      expiration,
      motDePasse
    ).subscribe({
      next: (lien: LienPartageDto) => {
        this.lienPartage = `http://localhost:4200/partage/${lien.token}`;
        this.lienProtegeParMotDePasse = !!motDePasse;
        this.creationLienEnCours = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Lien de partage cree'
        });
      },
      error: () => {
        this.creationLienEnCours = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la creation du lien'
        });
      }
    });
  }

  copierLien(): void {
    navigator.clipboard.writeText(this.lienPartage).then(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Copie',
        detail: 'Lien copie dans le presse-papiers'
      });
    });
  }

  rechercherUtilisateur(): void {
    if (!this.emailRecherche.trim()) return;
    this.rechercheEnCours = true;
    this.utilisateurTrouve = null;
    this.authService.rechercherUtilisateur(this.emailRecherche.trim()).subscribe({
      next: (utilisateur) => {
        this.utilisateurTrouve = utilisateur;
        this.rechercheEnCours = false;
      },
      error: () => {
        this.rechercheEnCours = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Non trouve',
          detail: 'Aucun utilisateur trouve avec cet email'
        });
      }
    });
  }

  partagerAvecUtilisateur(): void {
    if (!this.fichierSelectionne || !this.utilisateurTrouve) return;
    this.partageUtilisateurEnCours = true;
    this.fichierService.partagerAvecUtilisateur(
      this.fichierSelectionne.id,
      this.utilisateurTrouve.id,
      this.permissionPartageUtilisateur
    ).subscribe({
      next: () => {
        this.partageUtilisateurEnCours = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: `Fichier partage avec ${this.utilisateurTrouve!.username}`
        });
        this.dialogPartageVisible = false;
      },
      error: () => {
        this.partageUtilisateurEnCours = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du partage avec l\'utilisateur'
        });
      }
    });
  }

  formatTaille(octets: number): string {
    if (octets === 0) return '0 o';
    const unites = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(octets) / Math.log(1024));
    const taille = octets / Math.pow(1024, i);
    return `${taille.toFixed(i > 0 ? 1 : 0)} ${unites[i]}`;
  }

  deconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
