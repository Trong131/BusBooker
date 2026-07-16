package com.busbooker.controller;

import com.busbooker.entity.Bus;
import com.busbooker.entity.Ticket;
import com.busbooker.service.TicketService;
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
@RequestMapping("/tickets")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllTickets() {
        try {
            List<Ticket> tickets = ticketService.getAllTickets();
            return ResponseEntity.ok(tickets);
        } catch (Exception ex) {
            log.error("Error getting all tickets", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }


    @GetMapping("/userId")
    public ResponseEntity<?> getTicketsByUserId(@RequestParam String userId) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{ put("message", "userId is required"); }});
            }

      
            List<Ticket> tickets = ticketService.getTicketsByUserIdWithAutoUpdate(userId);
            
            if (tickets == null || tickets.isEmpty()) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            return ResponseEntity.ok(tickets);
        } catch (Exception ex) {
            log.error("Error getting tickets by user id: {}", userId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PostMapping("")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String scheduleId = (String) request.get("scheduleId");
            @SuppressWarnings("unchecked")
            List<String> seatNumbers = (List<String>) request.get("seatNumbers");
            Double price = ((Number) request.get("price")).doubleValue();
            String paymentMethod = (String) request.get("paymentMethod");
            String phoneNumber = (String) request.get("phoneNumber");
            String email = (String) request.get("email");
            String username = (String) request.get("username");
            String status = (String) request.get("status");
            String voucher = (String) request.get("voucher");

            Ticket ticket = ticketService.createTicket(userId, scheduleId, seatNumbers, price, 
                    paymentMethod, phoneNumber, email, username, status, voucher);
            return ResponseEntity.status(HttpStatus.OK).body(ticket);
        } catch (Exception ex) {
            log.error("Error creating ticket", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("")
    public ResponseEntity<?> updateTicket(@RequestBody Map<String, Object> request) {
        try {
            String ticketId = (String) request.get("ticketId");
            String status = (String) request.get("status");
            
            if (ticketId == null || status == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{ put("message", "ticketId and status are required"); }});
            }
            
            Ticket ticket = ticketService.updateTicketStatus(ticketId, status);
            return ResponseEntity.ok(ticket);
        } catch (Exception ex) {
            log.error("Error updating ticket", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("/cancel")
    public ResponseEntity<?> cancelTicket(@RequestBody Map<String, String> request) {
        try {
            String ticketId = request.get("ticketId");
            
            if (ticketId == null || ticketId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{ put("message", "ticketId is required"); }});
            }
            
            Ticket ticket = ticketService.cancelTicket(ticketId);
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("message", "Ticket cancelled successfully");
                put("ticket", ticket);
            }});
        } catch (Exception ex) {
            log.error("Error cancelling ticket", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PostMapping("/review")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String content = (String) request.get("content");
            Integer rating = ((Number) request.get("rating")).intValue();
            String busId = (String) request.get("busId");
            String ticketId = (String) request.get("ticketId");
            
            Bus bus = ticketService.addReview(userId, content, rating, busId, ticketId);
            return ResponseEntity.ok(bus);
        } catch (Exception ex) {
            log.error("Error adding review", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}

