/**
 * Genera el HTML de un certificado de grado.
 */
export function renderGradeCertificateHtml(
  name: string,
  grade: string,
  dojo: string,
  date: string
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Certificado de Grado - FVK</title>
<style>
  @page { margin: 0; size: A4 landscape; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Georgia, serif;
    width: 297mm; height: 210mm;
    display: flex; align-items: center; justify-content: center;
    background: #f5f5f5;
  }
  .certificate {
    width: 270mm; height: 185mm;
    background: white;
    border: 8px double #c00;
    border-radius: 12px;
    padding: 40px 50px;
    text-align: center;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .certificate::before {
    content: ''; position: absolute;
    top: 10px; left: 10px; right: 10px; bottom: 10px;
    border: 2px solid #c00;
    border-radius: 8px;
    pointer-events: none;
  }
  h1 {
    color: #c00;
    font-size: 32px;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 3px;
  }
  .subtitle {
    font-size: 14px;
    color: #666;
    margin-bottom: 30px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .intro {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
  }
  .student-name {
    font-size: 40px;
    font-weight: bold;
    color: #1a1a1a;
    margin: 15px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: 2px solid #c00;
    border-top: 2px solid #c00;
    padding: 12px 0;
    display: inline-block;
  }
  .grade-text {
    font-size: 24px;
    margin: 20px 0;
    color: #c00;
    font-weight: bold;
  }
  .details {
    font-size: 16px;
    color: #555;
    margin: 15px 0;
    line-height: 1.8;
  }
  .footer {
    margin-top: 35px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
  .footer-line {
    border-top: 1px solid #333;
    padding-top: 8px;
    width: 220px;
    text-align: center;
    color: #555;
  }
  .stamp {
    position: absolute;
    bottom: 50px; right: 60px;
    width: 100px; height: 100px;
    border: 3px solid #c00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
    color: #c00;
    transform: rotate(-15deg);
    opacity: 0.7;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.3;
    padding: 5px;
  }
</style>
</head>
<body>
<div class="certificate">
  <h1>Federación Venezolana de Kendo</h1>
  <div class="subtitle">Iaido &amp; Jodo</div>
  <div class="intro">Por la presente se otorga el presente certificado a:</div>
  <div class="student-name">${escapeHtml(name)}</div>
  <div class="grade-text">${escapeHtml(grade)}</div>
  <div class="details">
    Miembro del Dojo <strong>${escapeHtml(dojo)}</strong><br>
    Fecha de emisión: ${date}
  </div>
  <div class="footer">
    <div class="footer-line">Presidente de la FVK</div>
    <div class="footer-line">Director Técnico</div>
  </div>
  <div class="stamp">FVK<br>Oficial</div>
</div>
</body>
</html>`;
}

/**
 * Genera el HTML de una constancia de estudio.
 */
export function renderStudyCertificateHtml(
  name: string,
  identification: number,
  dojo: string,
  grade: string,
  date: string
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Constancia de Estudio - FVK</title>
<style>
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Georgia, serif;
    width: 210mm; height: 297mm;
    display: flex; align-items: center; justify-content: center;
    background: #f5f5f5;
  }
  .certificate {
    width: 185mm; height: 270mm;
    background: white;
    border: 6px double #1a3a6b;
    border-radius: 10px;
    padding: 35px 40px;
    text-align: center;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .certificate::before {
    content: ''; position: absolute;
    top: 8px; left: 8px; right: 8px; bottom: 8px;
    border: 1px solid #1a3a6b;
    border-radius: 6px;
    pointer-events: none;
  }
  h1 {
    color: #1a3a6b;
    font-size: 26px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .subtitle {
    font-size: 13px;
    color: #666;
    margin-bottom: 35px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .intro {
    font-size: 16px;
    margin-bottom: 30px;
    color: #333;
    text-align: justify;
    line-height: 1.6;
  }
  .student-name {
    font-size: 34px;
    font-weight: bold;
    color: #1a1a1a;
    margin: 15px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid #1a3a6b;
    display: inline-block;
    padding-bottom: 8px;
  }
  .info-table {
    text-align: left;
    margin: 30px auto;
    font-size: 16px;
    line-height: 2.2;
    width: 80%;
  }
  .info-table td { padding: 2px 10px; }
  .info-table td:first-child { font-weight: bold; width: 160px; color: #555; }
  .footer {
    margin-top: 50px;
    display: flex;
    justify-content: space-around;
    font-size: 13px;
  }
  .footer-line {
    border-top: 1px solid #333;
    padding-top: 8px;
    width: 180px;
    text-align: center;
    color: #555;
  }
  .stamp {
    position: absolute;
    bottom: 50px; right: 50px;
    width: 85px; height: 85px;
    border: 3px solid #1a3a6b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: #1a3a6b;
    transform: rotate(-15deg);
    opacity: 0.7;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.3;
    padding: 4px;
  }
</style>
</head>
<body>
<div class="certificate">
  <h1>Federación Venezolana de Kendo</h1>
  <div class="subtitle">Iaido &amp; Jodo</div>
  <p class="intro">
    Por medio de la presente, la Federación Venezolana de Kendo, Iaido &amp; Jodo
    hace constar que:
  </p>
  <div class="student-name">${escapeHtml(name)}</div>
  <table class="info-table">
    <tr><td>Cédula de Identidad:</td><td>${identification}</td></tr>
    <tr><td>Dojo:</td><td>${escapeHtml(dojo)}</td></tr>
    <tr><td>Grado Actual:</td><td>${escapeHtml(grade)}</td></tr>
    <tr><td>Fecha de Emisión:</td><td>${date}</td></tr>
  </table>
  <p class="intro" style="text-align: center; font-style: italic;">
    La presente constancia se expide a solicitud del interesado.
  </p>
  <div class="footer">
    <div class="footer-line">Presidente de la FVK</div>
    <div class="footer-line">Secretario</div>
  </div>
  <div class="stamp">FVK<br>Oficial</div>
</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
