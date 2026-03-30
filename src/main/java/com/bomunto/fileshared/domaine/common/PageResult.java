package com.bomunto.fileshared.domaine.common;

import java.util.List;

/**
 * Resultat pagine pour les requetes de liste.
 *
 * @param contenu       La liste des elements de la page courante.
 * @param page          Le numero de la page courante (commence a 0).
 * @param size          La taille de la page.
 * @param totalElements Le nombre total d'elements.
 * @param totalPages    Le nombre total de pages.
 */
public record PageResult<T>(List<T> contenu, int page, int size, long totalElements, int totalPages) {}
