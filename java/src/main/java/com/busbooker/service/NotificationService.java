package com.busbooker.service;

import com.busbooker.entity.Notification;
import com.busbooker.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id)
                .map(java.util.Collections::singletonList)
                .orElse(java.util.Collections.emptyList());
    }

    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByEmail(email);
    }

    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByRead(false);
    }

    public Notification createNotification(String username, String phoneNumber, String email, String garage) {
        Notification notification = Notification.builder()
                .username(username)
                .phoneNumber(phoneNumber)
                .email(email)
                .garage(garage != null ? garage : "")
                .read(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    public Notification markAsRead(String id) throws Exception {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (!notificationOpt.isPresent()) {
            throw new Exception("Notification not found");
        }

        Notification notification = notificationOpt.get();
        notification.setRead(true);
        notification.setUpdatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    public void deleteNotification(String id) throws Exception {
        if (!notificationRepository.existsById(id)) {
            throw new Exception("Notification not found");
        }
        notificationRepository.deleteById(id);
    }
}
 