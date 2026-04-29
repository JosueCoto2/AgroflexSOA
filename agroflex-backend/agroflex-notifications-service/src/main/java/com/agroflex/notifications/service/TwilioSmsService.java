package com.agroflex.notifications.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioSmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    @PostConstruct
    public void init() {
        if (twilioEnabled && !accountSid.isBlank() && !authToken.isBlank()) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio SMS inicializado");
        } else {
            log.info("Twilio SMS deshabilitado o sin credenciales — SMS omitidos");
        }
    }

    /**
     * Envía SMS via Twilio.
     * Retorna true si fue exitoso, false si está deshabilitado o falla.
     */
    public boolean enviar(String telefono, String texto) {
        if (!twilioEnabled) {
            log.debug("Twilio deshabilitado. SMS omitido para: {}", telefono);
            return false;
        }
        if (telefono == null || telefono.isBlank()) {
            log.debug("SMS no enviado: teléfono vacío");
            return false;
        }
        try {
            Message sms = Message.creator(
                    new PhoneNumber(telefono),
                    new PhoneNumber(fromNumber),
                    texto
            ).create();
            log.info("SMS enviado a {}. SID: {}", telefono, sms.getSid());
            return true;
        } catch (Exception e) {
            log.warn("Error enviando SMS a {}: {}", telefono, e.getMessage());
            return false;
        }
    }
}
