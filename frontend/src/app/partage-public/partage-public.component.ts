import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface LienInfo {
  nom: string;
  taille: number;
  typeMime: string;
  protegeParMotDePasse: boolean;
  permission: string;
}

@Component({
  selector: 'app-partage-public',
  templateUrl: './partage-public.component.html',
  styleUrls: ['./partage-public.component.scss']
})
export class PartagePublicComponent implements OnInit {

  private apiUrl = 'http://localhost:8081/api/v1';
  token = '';
  lienInfo: LienInfo | null = null;
  erreur = '';
  chargement = true;
  motDePasse = '';
  telechargementEnCours = false;

  // Preview
  previewUrl: string | null = null;
  previewPdfUrl: SafeResourceUrl | null = null;
  previewChargement = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.chargerInfoLien();
  }

  chargerInfoLien(): void {
    this.chargement = true;
    this.http.get<LienInfo>(`${this.apiUrl}/partages/${this.token}/info`).subscribe({
      next: (info) => {
        this.lienInfo = info;
        this.chargement = false;
        // Auto-preview si lecture seule et previewable
        if (info.permission === 'LECTURE' && this.estPreviewable(info.typeMime) && !info.protegeParMotDePasse) {
          this.chargerPreview();
        }
      },
      error: () => {
        this.erreur = 'Ce lien de partage est invalide ou a expire.';
        this.chargement = false;
      }
    });
  }

  estPreviewable(typeMime: string): boolean {
    return typeMime?.startsWith('image/') || typeMime === 'application/pdf';
  }

  chargerPreview(): void {
    this.previewChargement = true;
    this.http.get(`${this.apiUrl}/partages/${this.token}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (this.lienInfo?.typeMime.startsWith('image/')) {
          this.previewUrl = url;
        } else if (this.lienInfo?.typeMime === 'application/pdf') {
          this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
        this.previewChargement = false;
      },
      error: () => {
        this.previewChargement = false;
      }
    });
  }

  telecharger(): void {
    this.telechargementEnCours = true;

    if (this.lienInfo?.protegeParMotDePasse) {
      this.http.post(`${this.apiUrl}/partages/${this.token}/telecharger`,
        { motDePasse: this.motDePasse },
        { responseType: 'blob' }
      ).subscribe({
        next: (blob) => this.declencherTelechargement(blob),
        error: () => {
          this.telechargementEnCours = false;
          this.erreur = 'Mot de passe incorrect.';
        }
      });
    } else {
      this.http.get(`${this.apiUrl}/partages/${this.token}`, { responseType: 'blob' }).subscribe({
        next: (blob) => this.declencherTelechargement(blob),
        error: () => {
          this.telechargementEnCours = false;
          this.erreur = 'Erreur lors du telechargement.';
        }
      });
    }
  }

  private declencherTelechargement(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.lienInfo?.nom || 'fichier';
    a.click();
    URL.revokeObjectURL(url);
    this.telechargementEnCours = false;
  }

  formatTaille(octets: number): string {
    if (octets === 0) return '0 o';
    const unites = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(octets) / Math.log(1024));
    return `${(octets / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${unites[i]}`;
  }

  getIconeFichier(): string {
    const t = this.lienInfo?.typeMime || '';
    if (t.startsWith('image/')) return 'pi pi-image';
    if (t.startsWith('video/')) return 'pi pi-video';
    if (t.includes('pdf')) return 'pi pi-file-pdf';
    return 'pi pi-file';
  }
}
