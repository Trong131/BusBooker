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
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String username;
    private String phoneNumber;
    private String avatar;
    private String email;
    private String password;
    
    @Builder.Default
    private String role = "Customer"; 
    
    private String owner;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
