import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  formulaire: FormGroup;
  erreur = '';
  chargement = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    this.formulaire = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  connecter(): void {
    if (this.formulaire.invalid) return;

    this.chargement = true;
    this.erreur = '';

    this.authService.login(this.formulaire.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Erreur lors de la connexion';
      }
    })
  }
}
