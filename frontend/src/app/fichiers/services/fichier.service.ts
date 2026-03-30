import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { FichierDto, LienPartageDto, CreerLienRequest, ActiviteLogDto, PageResult } from '../models/fichier.models';

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

  uploadAvecProgression(file: File): { progress$: Observable<number>, result$: Observable<FichierDto> } {
    const formData = new FormData();
    formData.append('fichier', file);

    const progress$ = new Subject<number>();
    const result$ = new Subject<FichierDto>();

    const req = new HttpRequest('POST', `${this.apiUrl}`, formData, {
      reportProgress: true
    });

    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          progress$.next(percent);
        } else if (event.type === HttpEventType.Response) {
          progress$.next(100);
          progress$.complete();
          result$.next(event.body as FichierDto);
          result$.complete();
        }
      },
      error: (err) => {
        progress$.error(err);
        result$.error(err);
      }
    });

    return { progress$, result$ };
  }

  lister(page: number = 0, size: number = 50): Observable<PageResult<FichierDto>> {
    return this.http.get<PageResult<FichierDto>>(`${this.apiUrl}`, { params: { page, size } });
  }

  listerPartagesAvecMoi(): Observable<FichierDto[]> {
    return this.http.get<FichierDto[]>(`${this.apiUrl}/partages-avec-moi`);
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

  creerLien(fichierId: string, permission: string, expiration?: string, motDePasse?: string): Observable<LienPartageDto> {
    const body: CreerLienRequest = { permission };
    if (expiration) {
      body.expiration = expiration;
    }
    if (motDePasse) {
      body.motDePasse = motDePasse;
    }
    return this.http.post<LienPartageDto>(
      `${this.apiUrl}/${fichierId}/partager/lien`,
      body
    );
  }

  partagerAvecUtilisateur(fichierId: string, destinataireId: string, permission: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${fichierId}/partager/utilisateur`, {
      destinataireId,
      permission
    });
  }

  getPreviewUrl(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/telecharger`, { responseType: 'blob' });
  }

  renommer(id: string, nouveauNom: string): Observable<FichierDto> {
    return this.http.patch<FichierDto>(`${this.apiUrl}/${id}/renommer`, { nom: nouveauNom });
  }

  getQuota(): Observable<{utilise: number, maximum: number, disponible: number}> {
    return this.http.get<{utilise: number, maximum: number, disponible: number}>(`${this.apiUrl}/quota`);
  }

  getActivites(): Observable<ActiviteLogDto[]> {
    return this.http.get<ActiviteLogDto[]>(`${this.apiUrl}/activites`);
  }
}
