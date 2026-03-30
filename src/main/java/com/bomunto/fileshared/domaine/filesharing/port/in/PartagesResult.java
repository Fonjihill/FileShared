package com.bomunto.fileshared.domaine.filesharing.port.in;

import com.bomunto.fileshared.domaine.filesharing.LienPartage;
import com.bomunto.fileshared.domaine.filesharing.PartageUtilisateur;

import java.util.List;

public record PartagesResult(List<LienPartage> liens, List<PartageUtilisateur> utilisateurs) {
}
