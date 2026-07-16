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
@Document(collection = "schedules")
public class Schedule {
    @Id
    private String id;
    
    private Object busId;
    private Object routeId;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private Integer availableSeats;
    private List<Seat> seats;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Seat {
        private String seatNumber;
        
        @Builder.Default
        private Boolean isBooked = false;
        
        private String location; 
        private Double price;
		public boolean getIsBooked() {
			// TODO 
			return false;
		}
    }
}
