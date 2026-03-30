import { Component, OnInit } from '@angular/core';
import { FichierService } from '../../services/fichier.service';
import { FichierDto } from '../../models/fichier.models';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-partages-avec-moi',
  templateUrl: './partages-avec-moi.component.html',
  styleUrls: ['./partages-avec-moi.component.scss']
})
export class PartagesAvecMoiComponent implements OnInit {

  fichiers: FichierDto[] = [];
  chargement = false;

  constructor(
    private fichierService: FichierService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.chargerFichiers();
  }

  chargerFichiers(): void {
    this.chargement = true;
    this.fichierService.listerPartagesAvecMoi().subscribe({
      next: (fichiers) => {
        this.fichiers = fichiers;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les fichiers partages'
        });
      }
    });
  }

  telecharger(fichier: FichierDto): void {
    this.fichierService.telecharger(fichier.id);
  }

  getIconeFichier(typeMime: string): string {
    if (!typeMime) return 'pi pi-file';
    if (typeMime.startsWith('image/')) return 'pi pi-image';
    if (typeMime.startsWith('video/')) return 'pi pi-video';
    if (typeMime.includes('pdf')) return 'pi pi-file-pdf';
    return 'pi pi-file';
  }

  formatTaille(octets: number): string {
    if (octets === 0) return '0 o';
    const unites = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(octets) / Math.log(1024));
    return `${(octets / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${unites[i]}`;
  }
}
