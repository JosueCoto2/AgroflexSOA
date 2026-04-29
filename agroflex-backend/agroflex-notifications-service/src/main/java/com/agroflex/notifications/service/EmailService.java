package com.agroflex.notifications.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${notifications.email.from}")
    private String fromAddress;

    @Value("${notifications.email.from-name}")
    private String fromName;

    /**
     * Envía un correo simple.
     * Retorna true si fue exitoso, false si falló.
     * No lanza excepción para no interrumpir el flujo principal.
     */
    public boolean enviar(String destinatario, String asunto, String cuerpo) {
        if (destinatario == null || destinatario.isBlank()) {
            log.debug("Email no enviado: destinatario vacío");
            return false;
        }
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(fromName + " <" + fromAddress + ">");
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            log.info("Email enviado a {}: {}", destinatario, asunto);
            return true;
        } catch (MailException e) {
            log.warn("Error enviando email a {}: {}", destinatario, e.getMessage());
            return false;
        }
    }
}
