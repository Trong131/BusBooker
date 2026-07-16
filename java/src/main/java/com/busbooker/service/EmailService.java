package com.busbooker.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendForgotPasswordEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset Request");
            message.setText("Your OTP: " + otp);
            mailSender.send(message);
            log.info("Forgot password email sent to: " + email);
        } catch (Exception ex) {
            log.error("Error sending email", ex);
        }
    }

    public void sendNotificationEmail(String email, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("Notification email sent to: " + email);
        } catch (Exception ex) {
            log.error("Error sending email", ex);
        }
    }
}
 