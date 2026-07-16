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
@Document(collection = "vouchers")
public class Voucher {
    @Id
    private String id;
    
    private String code;
    private String name;
    private Double discount;
    private String discountType; 
    private LocalDateTime expiryDate;
    private String description;
    private Integer count;
    private String createdBy; 
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
