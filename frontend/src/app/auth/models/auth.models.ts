export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface UtilisateurDto {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export interface RegisterResponse {
  utilisateur: UtilisateurDto;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  motDePasse: string;
}
