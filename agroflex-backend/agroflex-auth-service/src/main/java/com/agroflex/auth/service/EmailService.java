package com.agroflex.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@agroflex.mx}")
    private String from;

    /**
     * Envía el código de verificación de 6 dígitos al correo indicado.
     */
    public void enviarCodigoVerificacion(String destinatario, String codigo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(from);
            helper.setTo(destinatario);
            helper.setSubject("Tu código de verificación AgroFlex");
            helper.setText(construirHtml(codigo), true);

            mailSender.send(message);
            log.info("Código de verificación enviado a: {}", destinatario);
        } catch (Exception e) {
            log.error("Error al enviar código de verificación a {} — {}: {}", destinatario, e.getClass().getSimpleName(), e.getMessage());
            Throwable cause = e.getCause();
            while (cause != null) {
                log.error("  Causa: {} — {}", cause.getClass().getSimpleName(), cause.getMessage());
                cause = cause.getCause();
            }
            throw new RuntimeException("No se pudo enviar el correo de verificación. " +
                    "Verifica que la dirección sea correcta e intenta de nuevo.");
        }
    }

    private String construirHtml(String codigo) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Verificación AgroFlex</title>
                </head>
                <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:16px;overflow:hidden;
                                      box-shadow:0 4px 24px rgba(0,0,0,.08);">
                          <!-- Header verde -->
                          <tr>
                            <td style="background:#1E7A45;padding:32px 40px;text-align:center;">
                              <p style="margin:0;color:#ffffff;font-size:26px;font-weight:700;
                                        letter-spacing:-0.5px;">AgroFlex</p>
                              <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:13px;">
                                Juntos por el progreso de nuestro campo.
                              </p>
                            </td>
                          </tr>
                          <!-- Cuerpo -->
                          <tr>
                            <td style="padding:36px 40px 28px;">
                              <p style="margin:0 0 8px;color:#1E7A45;font-size:13px;
                                        text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                                Verificación de correo
                              </p>
                              <h2 style="margin:0 0 16px;color:#1a2e1e;font-size:22px;font-weight:700;">
                                Tu código de verificación
                              </h2>
                              <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;">
                                Usa el siguiente código para completar tu registro en AgroFlex.
                                Es válido por <strong>10 minutos</strong>.
                              </p>
                              <!-- Código destacado -->
                              <div style="background:#f0fdf4;border:2px solid #6ABF3A;border-radius:12px;
                                          padding:24px;text-align:center;margin-bottom:28px;">
                                <p style="margin:0;color:#1E7A45;font-size:42px;font-weight:700;
                                          letter-spacing:12px;font-family:monospace;">
                                  %s
                                </p>
                              </div>
                              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.5;">
                                Si no solicitaste este código, puedes ignorar este correo.
                                Nunca compartas este código con nadie.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f8fafc;padding:20px 40px;text-align:center;
                                       border-top:1px solid #e2e8f0;">
                              <p style="margin:0;color:#94a3b8;font-size:12px;">
                                © 2026 AgroFlex · Todos los derechos reservados
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(codigo);
    }
}
