import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  formulaire: FormGroup;
  erreur = '';
  chargement = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router) {
    this.formulaire = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  inscrire(): void {
    if (this.formulaire.invalid) return;

    this.chargement = true;
    this.erreur = '';

    this.authService.register(this.formulaire.value).subscribe({

      next: () => {
        this.router.navigate(['/login']);
      },

      error: (err) => {
        this.chargement = false;
        this.erreur = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}
