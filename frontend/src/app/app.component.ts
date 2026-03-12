import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // TODO: Déclare deux propriétés :
  // 1. "titre" de type string avec la valeur "FileShared"
  // 2. "message" de type string avec la valeur "Bienvenue sur notre plateforme de partage"
  titre = "FileShared";
  message = "Bienvenue sur notre plateforme de partage";

  // TODO: Crée une méthode "changerMessage()" qui change la valeur de "message"
  // en "Prêt à partager vos fichiers !"
  compteur = 0;

  changerMessage() {
    this.message = "Prêt à partager vos fichiers !";
    this.compteur += 1;
  }

  estConnectee = false;

  seConnecter() {
    this.estConnectee = true;
  }
}
