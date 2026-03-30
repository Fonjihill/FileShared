import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { UtilisateurDto } from '../auth/models/auth.models';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  utilisateur: UtilisateurDto | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfil().subscribe({
      next: (profil) => this.utilisateur = profil
    });
  }

  getInitiale(): string {
    return this.utilisateur?.username?.charAt(0).toUpperCase() || '?';
  }
}
