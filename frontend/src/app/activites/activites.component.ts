import { Component, OnInit } from '@angular/core';
import { FichierService } from '../fichiers/services/fichier.service';
import { ActiviteLogDto } from '../fichiers/models/fichier.models';

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.scss']
})
export class ActivitesComponent implements OnInit {

  activites: ActiviteLogDto[] = [];
  chargement = false;

  constructor(private fichierService: FichierService) {}

  ngOnInit(): void {
    this.chargerActivites();
  }

  chargerActivites(): void {
    this.chargement = true;
    this.fichierService.getActivites().subscribe({
      next: (activites) => {
        this.activites = activites;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  getActiviteIcon(action: string): string {
    switch (action) {
      case 'UPLOAD': return 'pi pi-upload';
      case 'TELECHARGER': return 'pi pi-download';
      case 'SUPPRIMER': return 'pi pi-trash';
      case 'PARTAGER_LIEN': return 'pi pi-link';
      case 'PARTAGER_UTILISATEUR': return 'pi pi-user-plus';
      default: return 'pi pi-clock';
    }
  }

  getActiviteIconClass(action: string): string {
    switch (action) {
      case 'UPLOAD': return 'activite-icon-upload';
      case 'TELECHARGER': return 'activite-icon-download';
      case 'SUPPRIMER': return 'activite-icon-supprimer';
      case 'PARTAGER_LIEN': return 'activite-icon-partage';
      case 'PARTAGER_UTILISATEUR': return 'activite-icon-partage';
      default: return '';
    }
  }
}
