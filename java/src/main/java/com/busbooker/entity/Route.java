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
@Document(collection = "routes")
public class Route {
    @Id
    private String id;
    
    private String img;
    private String origin;
    private String destination; 
    private Double basisPrice; 
    private Double afterDiscount;
    
    private Object schedules; 
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
