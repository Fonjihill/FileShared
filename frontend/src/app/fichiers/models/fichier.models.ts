export interface FichierDto {
  id: string;
  nom: string;
  nomOriginal: string;
  taille: number;
  typeMime: string;
  statut: string;
  createdAt: string;
}

export interface LienPartageDto {
  id: string;
  fichierId: string;
  token: string;
  permission: string;
  expiration: string;
  actif: boolean;
  createdAt: string;
}

export interface CreerLienRequest {
  permission: string;
  expiration?: string;
}
