package com.busbooker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;
    
    private String userId;
    
    @Builder.Default
    private String status = "waiting"; 
    
    private String paymentMethod;
    private Object scheduleId;
    private List<String> seatNumbers;
    private Double price;
    
    private String phoneNumber;
    private String email;
    private String username;
    
    private String voucher;
    
    @Builder.Default
    private Boolean hasReviewed = false;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
