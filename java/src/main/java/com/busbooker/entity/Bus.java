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
@Document(collection = "buses")
public class Bus {
    @Id
    private String id;
    
    private List<String> img;
    private Integer totalSeats;
    
    @Builder.Default
    private String status = "active";
    
    private String owner;
    private String licensePlate;
    private List<String> reviews;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
