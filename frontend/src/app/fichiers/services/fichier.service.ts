import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FichierDto, LienPartageDto, CreerLienRequest } from '../models/fichier.models';

@Injectable({
  providedIn: 'root'
})
export class FichierService {

  private readonly apiUrl = 'http://localhost:8081/api/v1/fichiers';

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<FichierDto> {
    const formData = new FormData();
    formData.append('fichier', file);
    return this.http.post<FichierDto>(`${this.apiUrl}`, formData);
  }

  lister(): Observable<FichierDto[]> {
    return this.http.get<FichierDto[]>(`${this.apiUrl}`);
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  telecharger(id: string): void {
    this.http.get(`${this.apiUrl}/${id}/telecharger`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  creerLien(fichierId: string, permission: string, expiration?: string): Observable<LienPartageDto> {
    const body: CreerLienRequest = { permission };
    if (expiration) {
      body.expiration = expiration;
    }
    return this.http.post<LienPartageDto>(
      `${this.apiUrl}/${fichierId}/partager/lien`,
      body
    );
  }
}
