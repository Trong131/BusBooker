package com.busbooker.controller;

import com.busbooker.entity.Notification;
import com.busbooker.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/noti")
@CrossOrigin(origins = {"http://localhost:3000/"})
@Slf4j
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("")
    public ResponseEntity<?> getAllNotifications() {
        try {
            List<Notification> notifications = notificationService.getAllNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllNotificationsAlternate() {
        try {
            List<Notification> notifications = notificationService.getAllNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getNotificationById(@PathVariable String id) {
        try {
            List<Notification> notifications = notificationService.getNotificationById(id);
            return ResponseEntity.ok(notifications);
        } catch (Exception ex) {
            log.error("Error getting notification by id: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications() {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PostMapping("")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String phoneNumber = request.get("phoneNumber");
            String email = request.get("email");
            String garage = request.get("garage");

            Notification notification = notificationService.createNotification(username, phoneNumber, email, garage);
            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotification(@PathVariable String id, @RequestBody Notification updateData) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Notification deleted successfully"); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}