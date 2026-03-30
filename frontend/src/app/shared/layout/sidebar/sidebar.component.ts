import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { FichierService } from '../../../fichiers/services/fichier.service';
import { UtilisateurDto } from '../../../auth/models/auth.models';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  utilisateur: UtilisateurDto | null = null;
  quota: { utilise: number, maximum: number, disponible: number } | null = null;
  quotaPercent = 0;
  private routeSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private fichierService: FichierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getProfil().subscribe({
      next: (profil) => this.utilisateur = profil,
      error: () => {}
    });
    this.chargerQuota();

    // Rafraîchir le quota à chaque navigation (quand on revient au dashboard après un upload)
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.chargerQuota();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  chargerQuota(): void {
    this.fichierService.getQuota().subscribe({
      next: (quota) => {
        this.quota = quota;
        this.quotaPercent = quota.maximum > 0 ? (quota.utilise / quota.maximum) * 100 : 0;
      },
      error: () => {}
    });
  }

  get quotaCouleur(): string {
    if (this.quotaPercent < 50) return '#059669';   // vert — tranquille
    if (this.quotaPercent < 75) return '#f59e0b';   // orange — attention
    return '#ef4444';                                // rouge — critique
  }

  formatTaille(octets: number): string {
    if (octets === 0) return '0 o';
    const unites = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(octets) / Math.log(1024));
    return `${(octets / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${unites[i]}`;
  }

  getInitiale(): string {
    return this.utilisateur?.username?.charAt(0).toUpperCase() || '?';
  }

  deconnecter(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
