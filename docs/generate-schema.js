const { createCanvas } = require("canvas");
const fs = require("fs");

const W = 1200, H = 900;
const c = createCanvas(W, H);
const ctx = c.getContext("2d");

// Background
ctx.fillStyle = "#FFFFFF";
ctx.fillRect(0, 0, W, H);

// Helper functions
function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function arrow(x1, y1, x2, y2, color, dashed) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  if (dashed) ctx.setLineDash([8, 4]);
  else ctx.setLineDash([]);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  // arrowhead
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const sz = 12;
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - sz * Math.cos(angle - 0.4), y2 - sz * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - sz * Math.cos(angle + 0.4), y2 - sz * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

function text(t, x, y, size, color, align, bold) {
  ctx.fillStyle = color || "#2C3E50";
  ctx.font = (bold ? "bold " : "") + size + "px Arial";
  ctx.textAlign = align || "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t, x, y);
}

// Title
text("Architecture Hexagonale — FileShared", W/2, 35, 24, "#1B4F72", "center", true);

// ── INFRASTRUCTURE LAYER (outermost) ──
roundRect(30, 65, W - 60, H - 95, 20, "#FDF2E9", "#E67E22");
text("INFRASTRUCTURE", W/2, 90, 16, "#E67E22", "center", true);

// ── APPLICATION LAYER (middle) ──
roundRect(160, 120, W - 320, H - 250, 16, "#EBF5FB", "#2E86C1");
text("APPLICATION", W/2, 145, 15, "#2E86C1", "center", true);

// ── DOMAIN (center) ──
roundRect(310, 175, W - 620, H - 400, 14, "#E8F8F5", "#1A8870");
text("DOMAINE (coeur pur)", W/2, 200, 15, "#1A8870", "center", true);

// Domain items
const domainX = 340, domainY = 225;
roundRect(domainX, domainY, 160, 50, 8, "#D5F5E3", "#1A8870");
text("Utilisateur", domainX + 80, domainY + 18, 13, "#1A8870", "center", true);
text("(POJO pur)", domainX + 80, domainY + 36, 11, "#7F8C8D", "center", false);

roundRect(domainX + 190, domainY, 140, 50, 8, "#D5F5E3", "#1A8870");
text("Role", domainX + 260, domainY + 18, 13, "#1A8870", "center", true);
text("(enum)", domainX + 260, domainY + 36, 11, "#7F8C8D", "center", false);

roundRect(domainX + 360, domainY, 160, 50, 8, "#D5F5E3", "#1A8870");
text("EntityAbstract", domainX + 440, domainY + 18, 13, "#1A8870", "center", true);
text("(timestamps)", domainX + 440, domainY + 36, 11, "#7F8C8D", "center", false);

// Ports IN
const portInY = domainY + 75;
roundRect(domainX + 50, portInY, 200, 45, 8, "#ABEBC6", "#196F3D");
text("PORT IN", domainX + 150, portInY + 15, 11, "#196F3D", "center", true);
text("RegisterUseCase", domainX + 150, portInY + 33, 12, "#196F3D", "center", false);

// Ports OUT
roundRect(domainX + 290, portInY, 200, 45, 8, "#ABEBC6", "#196F3D");
text("PORTS OUT", domainX + 390, portInY + 15, 11, "#196F3D", "center", true);
text("Repository | Token | Hash", domainX + 390, portInY + 33, 11, "#196F3D", "center", false);

// Exception
roundRect(domainX + 140, portInY + 60, 240, 35, 8, "#FADBD8", "#E74C3C");
text("EmailDejaUtiliseException", domainX + 260, portInY + 78, 12, "#E74C3C", "center", false);

// ── APPLICATION items ──
const appY = 480;
roundRect(400, appY, 400, 50, 8, "#D6EAF8", "#2E86C1");
text("AuthServiceImpl", W/2, appY + 18, 14, "#2E86C1", "center", true);
text("implements RegisterUseCase", W/2, appY + 37, 11, "#7F8C8D", "center", false);

// Arrow: AuthServiceImpl -> Port IN
arrow(W/2 - 60, appY, domainX + 150, portInY + 45, "#2E86C1", false);
// Arrow: AuthServiceImpl -> Ports OUT
arrow(W/2 + 60, appY, domainX + 390, portInY + 45, "#2E86C1", true);

// ── INFRASTRUCTURE items ──
// LEFT: Web
const webX = 45, webY = 140;
roundRect(webX, webY, 100, 40, 6, "#F5B7B1", "#E74C3C");
text("Controller", webX + 50, webY + 14, 12, "#E74C3C", "center", true);
text("REST", webX + 50, webY + 30, 10, "#7F8C8D", "center", false);

roundRect(webX, webY + 55, 100, 40, 6, "#F5B7B1", "#E74C3C");
text("DTOs HTTP", webX + 50, webY + 69, 11, "#E74C3C", "center", true);
text("Request/Resp", webX + 50, webY + 85, 10, "#7F8C8D", "center", false);

roundRect(webX, webY + 110, 100, 40, 6, "#F5B7B1", "#E74C3C");
text("WebMapper", webX + 50, webY + 124, 11, "#E74C3C", "center", true);
text("DTO<->Cmd", webX + 50, webY + 140, 10, "#7F8C8D", "center", false);

// Arrow: Controller -> Application
arrow(webX + 100, webY + 20, 400, appY + 25, "#E74C3C", false);
text("appelle", 230, appY - 20, 11, "#E74C3C", "center", false);

// RIGHT: Persistence
const persX = W - 145, persY = 140;
roundRect(persX, persY, 110, 40, 6, "#D4EFDF", "#27AE60");
text("JpaEntity", persX + 55, persY + 14, 12, "#27AE60", "center", true);
text("@Entity", persX + 55, persY + 30, 10, "#7F8C8D", "center", false);

roundRect(persX, persY + 55, 110, 40, 6, "#D4EFDF", "#27AE60");
text("JpaRepo", persX + 55, persY + 69, 12, "#27AE60", "center", true);
text("Spring Data", persX + 55, persY + 85, 10, "#7F8C8D", "center", false);

roundRect(persX, persY + 110, 110, 40, 6, "#D4EFDF", "#27AE60");
text("Adapter", persX + 55, persY + 124, 12, "#27AE60", "center", true);
text("impl. Port", persX + 55, persY + 140, 10, "#7F8C8D", "center", false);

roundRect(persX, persY + 165, 110, 40, 6, "#D4EFDF", "#27AE60");
text("Mapper", persX + 55, persY + 179, 12, "#27AE60", "center", true);
text("JPA<->Dom", persX + 55, persY + 195, 10, "#7F8C8D", "center", false);

// Arrow: Adapter -> Port OUT
arrow(persX, persY + 144, domainX + 490, portInY + 22, "#27AE60", false);
text("implemente", persX - 80, persY + 100, 11, "#27AE60", "center", false);

// BOTTOM: Security adapters
const secX = 80, secY = H - 140;
roundRect(secX, secY, 160, 55, 8, "#D6EAF8", "#8E44AD");
text("JwtTokenAdapter", secX + 80, secY + 18, 12, "#8E44AD", "center", true);
text("impl. TokenProvider", secX + 80, secY + 36, 10, "#7F8C8D", "center", false);

roundRect(secX + 200, secY, 190, 55, 8, "#D6EAF8", "#8E44AD");
text("BcryptPasswordAdapter", secX + 295, secY + 18, 11, "#8E44AD", "center", true);
text("impl. PasswordHasher", secX + 295, secY + 36, 10, "#7F8C8D", "center", false);

roundRect(secX + 430, secY, 180, 55, 8, "#D6EAF8", "#8E44AD");
text("JwtAuthFilter", secX + 520, secY + 18, 12, "#8E44AD", "center", true);
text("Spring Security", secX + 520, secY + 36, 10, "#7F8C8D", "center", false);

roundRect(secX + 650, secY, 180, 55, 8, "#D6EAF8", "#8E44AD");
text("SecurityConfig", secX + 740, secY + 18, 12, "#8E44AD", "center", true);
text("Beans + Filter Chain", secX + 740, secY + 36, 10, "#7F8C8D", "center", false);

// Arrows from security adapters to ports
arrow(secX + 80, secY, domainX + 350, portInY + 45, "#8E44AD", false);
arrow(secX + 295, secY, domainX + 430, portInY + 45, "#8E44AD", false);

// Legend
const legX = 45, legY = H - 55;
text("Legende:", legX + 30, legY, 12, "#2C3E50", "left", true);
roundRect(legX + 95, legY - 10, 15, 15, 3, "#E8F8F5", "#1A8870");
text("Domaine", legX + 140, legY, 11, "#2C3E50", "left", false);
roundRect(legX + 210, legY - 10, 15, 15, 3, "#EBF5FB", "#2E86C1");
text("Application", legX + 260, legY, 11, "#2C3E50", "left", false);
roundRect(legX + 345, legY - 10, 15, 15, 3, "#F5B7B1", "#E74C3C");
text("Web", legX + 375, legY, 11, "#2C3E50", "left", false);
roundRect(legX + 415, legY - 10, 15, 15, 3, "#D4EFDF", "#27AE60");
text("Persistance", legX + 470, legY, 11, "#2C3E50", "left", false);
roundRect(legX + 555, legY - 10, 15, 15, 3, "#D6EAF8", "#8E44AD");
text("Securite", legX + 600, legY, 11, "#2C3E50", "left", false);

// Direction label
text("Dependances : exterieur -> interieur (jamais l'inverse)", W/2, legY + 25, 12, "#E74C3C", "center", true);

fs.writeFileSync(__dirname + "/schema-hexagonal.png", c.toBuffer("image/png"));
console.log("Schema genere");
