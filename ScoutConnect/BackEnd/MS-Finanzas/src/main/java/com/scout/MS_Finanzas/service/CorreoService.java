package com.scout.MS_Finanzas.service;

import com.scout.MS_Finanzas.exception.EnvioCorreoException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class CorreoService {
    private static final Logger logger = LoggerFactory.getLogger(CorreoService.class);
    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String correoRemitente;
    public CorreoService(JavaMailSender mailSender) {this.mailSender = mailSender;}
    public void enviarComprobante(String destinatario, Long ordenId, byte[] archivoPdf) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(correoRemitente);
            helper.setTo(destinatario);
            helper.setSubject("ScoutConnect - Comprobante de compra N° " + ordenId);
            String contenido = """
                <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>ScoutConnect</h2>
                    <p>Hola,</p>
                    <p>Se adjunta el comprobante de tu compra.</p>
                    <p><strong>Orden N°:</strong> %d</p>
                    <p>Puedes descargar el documento adjunto con el detalle de tu compra.</p>
                    <br>
                    <p>Saludos,<br>Equipo ScoutConnect</p>
                </body>
                </html>
                """.formatted(ordenId);
            helper.setText(contenido, true);
            helper.addAttachment("Comprobante_ScoutConnect_Orden_" + ordenId + ".pdf", new ByteArrayResource(archivoPdf), "application/pdf");
            mailSender.send(mensaje);
        } catch (MessagingException e) {logger.error("Error al preparar el correo del comprobante de la orden {}.", ordenId,e);
            throw new EnvioCorreoException("No fue posible preparar el correo del comprobante.", e);
        } catch (MailException e) {logger.error("Error SMTP al enviar el comprobante de la orden {}.", ordenId, e);
            throw new EnvioCorreoException("No fue posible enviar el correo. Verifica la configuración SMTP.", e);
        }
    }
}