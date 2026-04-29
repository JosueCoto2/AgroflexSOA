package com.agroflex.notifications.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PushNotificationService {

    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;

    /**
     * Envía push via FCM.
     * Retorna true si fue exitoso, false si está deshabilitado o falla.
     */
    public boolean enviar(String fcmToken, String titulo, String cuerpo) {
        if (!firebaseEnabled) {
            log.debug("Push FCM deshabilitado");
            return false;
        }
        if (fcmToken == null || fcmToken.isBlank()) {
            log.debug("Push no enviado: fcmToken vacío");
            return false;
        }
        try {
            Message mensaje = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(titulo)
                            .setBody(cuerpo)
                            .build())
                    .setToken(fcmToken)
                    .build();

            String messageId = FirebaseMessaging.getInstance().send(mensaje);
            log.info("Push enviado. MessageId: {}", messageId);
            return true;
        } catch (FirebaseMessagingException e) {
            log.warn("Error enviando push FCM: {}", e.getMessage());
            return false;
        }
    }
}
