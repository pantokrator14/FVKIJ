import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const APP_NAME = "FVK - Sistema Administrativo";

// Lazy initialization: Resend se crea solo si hay API key
let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) {
    _resend = new Resend(key);
  }
  return _resend;
}

/**
 * Envía un correo electrónico usando Resend.
 * Los errores se registran pero NO interrumpen el flujo principal.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const r = getResend();

  // Si no hay API key configurada, solo simular
  if (!r) {
    console.log(`[EMAIL SIMULADO] Para: ${to} | Asunto: ${subject}`);
    console.log(`[EMAIL SIMULADO] Contenido: ${html.substring(0, 200)}...`);
    return;
  }

  try {
    const { data, error } = await r.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(`Error de Resend enviando email a ${to}:`, error);
    } else {
      console.log(`Email enviado a ${to}: ${subject} (id: ${data?.id})`);
    }
  } catch (error) {
    console.error(`Error enviando email a ${to}:`, error);
  }
}

// ─── Plantillas de email ──────────────────────────────────────

/**
 * Notificación de pago registrado.
 */
export function paymentCreatedEmail(
  userName: string,
  amount: number,
  description: string,
  type: "ingreso" | "egreso",
  targetName: string
): string {
  const typeLabel = type === "ingreso" ? "ingreso recibido" : "egreso registrado";
  return `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #dd1818; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">${APP_NAME}</h2>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h3>¡${typeLabel === "ingreso recibido" ? "Pago recibido" : "Egreso registrado"}!</h3>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Se ha registrado un ${typeLabel} en el sistema:</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Monto</td><td style="padding:8px; border:1px solid #ddd;">$${amount.toFixed(2)}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Concepto</td><td style="padding:8px; border:1px solid #ddd;">${description}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Tipo</td><td style="padding:8px; border:1px solid #ddd;">${typeLabel}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Destino/Origen</td><td style="padding:8px; border:1px solid #ddd;">${targetName}</td></tr>
        </table>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Este es un correo automático del sistema administrativo FVK.
        </p>
      </div>
    </div>
  `;
}

/**
 * Notificación de nuevo estudiante registrado.
 */
export function newStudentEmail(userName: string, email: string, password: string, dojoName: string): string {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #dd1818; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">${APP_NAME}</h2>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h3>¡Bienvenido a la FVK!</h3>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Has sido registrado como estudiante del dojo <strong>${dojoName}</strong>.</p>
        <p>Tus credenciales de acceso son:</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Email</td><td style="padding:8px; border:1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Contraseña</td><td style="padding:8px; border:1px solid #ddd;">${password}</td></tr>
        </table>
        <p>Te recomendamos cambiar tu contraseña al iniciar sesión.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Este es un correo automático del sistema administrativo FVK.
        </p>
      </div>
    </div>
  `;
}

/**
 * Notificación de equipo asignado.
 */
export function equipmentAssignedEmail(
  userName: string,
  equipmentType: string,
  equipmentDescription: string
): string {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #dd1818; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">${APP_NAME}</h2>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h3>¡Equipo Asignado!</h3>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Se te ha asignado un equipo:</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Tipo</td><td style="padding:8px; border:1px solid #ddd;">${equipmentType}</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Descripción</td><td style="padding:8px; border:1px solid #ddd;">${equipmentDescription}</td></tr>
        </table>
        <p>Puedes ver los detalles en tu perfil de estudiante.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Este es un correo automático del sistema administrativo FVK.
        </p>
      </div>
    </div>
  `;
}

/**
 * Notificación de nuevo dojo registrado (para el admin que lo registró).
 */
export function newDojoEmail(dojoName: string, adminName: string, adminEmail: string): string {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #dd1818; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">${APP_NAME}</h2>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h3>¡Dojo Registrado!</h3>
        <p>Hola <strong>${adminName}</strong>,</p>
        <p>El dojo <strong>${dojoName}</strong> ha sido registrado exitosamente en el sistema.</p>
        <p>Tus credenciales de administrador del dojo son:</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding:8px; border:1px solid #ddd; font-weight:bold;">Email</td><td style="padding:8px; border:1px solid #ddd;">${adminEmail}</td></tr>
        </table>
        <p><strong>Importante:</strong> Tu cuenta está pendiente de verificación por la FVK. 
        Recibirás un correo cuando sea activada.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Este es un correo automático del sistema administrativo FVK.
        </p>
      </div>
    </div>
  `;
}

/**
 * Notificación de cuenta verificada (dojo activado).
 */
export function accountVerifiedEmail(
  userName: string,
  dojoName: string
): string {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
      <div style="background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">${APP_NAME}</h2>
      </div>
      <div style="padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h3>¡Cuenta Verificada!</h3>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Tu cuenta como administrador del dojo <strong>${dojoName}</strong> 
        ha sido <strong style="color: #28a745;">verificada y activada</strong> por la FVK.</p>
        <p>Ya puedes ingresar al sistema con tus credenciales.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">
          Este es un correo automático del sistema administrativo FVK.
        </p>
      </div>
    </div>
  `;
}
