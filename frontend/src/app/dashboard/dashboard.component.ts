import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { FichierService } from '../fichiers/services/fichier.service';
import { FichierDto, LienPartageDto } from '../fichiers/models/fichier.models';
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
  lienPartage = '';
  creationLienEnCours = false;

  constructor(
    private authService: AuthService,
    private fichierService: FichierService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerProfil();
    this.chargerFichiers();
  }

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
      next: (fichiers) => {
        this.fichiers = fichiers;
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
    this.fichierService.upload(file).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Fichier envoye avec succes'
        });
        this.chargerFichiers();
      },
      error: () => {
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
    this.lienPartage = '';
    this.dialogPartageVisible = true;
  }

  creerLienPartage(): void {
    if (!this.fichierSelectionne) return;
    this.creationLienEnCours = true;
    const expiration = this.expirationPartage
      ? new Date(this.expirationPartage).toISOString()
      : undefined;
    this.fichierService.creerLien(
      this.fichierSelectionne.id,
      this.permissionPartage,
      expiration
    ).subscribe({
      next: (lien: LienPartageDto) => {
        this.lienPartage = `http://localhost:8081/api/v1/partages/${lien.token}`;
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
}
