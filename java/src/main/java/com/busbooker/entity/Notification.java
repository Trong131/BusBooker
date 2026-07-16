package com.busbooker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    private String username;
    private String phoneNumber;
    private String email;
    private String garage;
    
    @Builder.Default
    private Boolean read = false;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
