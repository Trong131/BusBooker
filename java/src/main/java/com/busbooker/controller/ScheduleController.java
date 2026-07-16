package com.busbooker.controller;
 
import com.busbooker.entity.Schedule;
import com.busbooker.service.ScheduleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
 
@RestController
@RequestMapping("/schedule")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class ScheduleController {
   
    @Autowired
    private ScheduleService scheduleService;
   
    @GetMapping("/all")
    public ResponseEntity<?> getAllSchedules() {
        try {
            List<Schedule> schedules = scheduleService.getAllSchedules();
            return ResponseEntity.ok(schedules);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @GetMapping("/{id}")
    public ResponseEntity<?> getScheduleById(@PathVariable String id) {
        try {
            Optional<Schedule> schedule = scheduleService.getScheduleById(id);
            if (!schedule.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Schedule not found"); }});
            }
            return ResponseEntity.ok(schedule.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @GetMapping("")
    public ResponseEntity<?> getSchedulesByDate(@RequestParam(required = false) String startTime) {
        try {
            List<Schedule> schedules = scheduleService.getSchedulesByDate(startTime);
            return ResponseEntity.ok(schedules);
        } catch (Exception ex) {
            log.error("Error getting schedules by date", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PostMapping("")
    public ResponseEntity<?> createSchedule(@RequestBody Map<String, Object> request) {
        try {
            String busId = (String) request.get("busId");
            String routeId = (String) request.get("routeId");

            LocalDateTime startTime = java.time.OffsetDateTime
                    .parse((String) request.get("startTime"))
                    .toLocalDateTime();

            LocalDateTime endTime = java.time.OffsetDateTime
                    .parse((String) request.get("endTime"))
                    .toLocalDateTime();

            @SuppressWarnings("unchecked")
            Map<String, Object> rawPrice =
                    (Map<String, Object>) request.get("price");

            Map<String, Double> priceMap = new HashMap<>();
            for (Map.Entry<String, Object> e : rawPrice.entrySet()) {
                priceMap.put(
                        e.getKey(),
                        ((Number) e.getValue()).doubleValue()
                );
            }

            Schedule schedule = scheduleService.createSchedule(
                    busId, routeId, startTime, endTime, priceMap
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(schedule);

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{
                        put("message", ex.getMessage());
                    }});
        }
    }


    @PutMapping(value = "/book-seat", consumes = "application/json", produces = "application/json")
    public ResponseEntity<?> bookSeat(@RequestBody Map<String, Object> requestBody) {
        try {
            if (requestBody == null || requestBody.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("message", "Request body is required");
                        }});
            }
           
            Object scheduleIdObj = requestBody.get("scheduleId");
            String scheduleId = null;
            if (scheduleIdObj != null) {
                if (scheduleIdObj instanceof String) {
                    scheduleId = (String) scheduleIdObj;
                } else if (scheduleIdObj instanceof Map) {
                    // If it's an object, try to get _id or id
                    @SuppressWarnings("unchecked")
                    Map<String, Object> scheduleObj = (Map<String, Object>) scheduleIdObj;
                    Object idObj = scheduleObj.get("_id");
                    if (idObj == null) {
                        idObj = scheduleObj.get("id");
                    }
                    if (idObj != null) {
                        scheduleId = idObj.toString();
                    }
                } else {
                    scheduleId = scheduleIdObj.toString();
                }
            }
           
            if (scheduleId == null || scheduleId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("message", "scheduleId is required");
                        }});
            }
           
            final String finalScheduleId = scheduleId;

            Object seatNumberObj = requestBody.get("seatNumber");
            List<String> seatNumbers = new java.util.ArrayList<>();
           
            if (seatNumberObj == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("message", "seatNumber is required");
                        }});
            }
           
            if (seatNumberObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> seatList = (List<Object>) seatNumberObj;
                for (Object item : seatList) {
                    if (item instanceof String) {
                        seatNumbers.add((String) item);
                    } else if (item instanceof Number) {
                        seatNumbers.add(String.valueOf(item));
                    } else {
                        seatNumbers.add(item.toString());
                    }
                }
            } else if (seatNumberObj instanceof String) {
                seatNumbers.add((String) seatNumberObj);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("message", "seatNumber must be an array");
                        }});
            }
           
            if (seatNumbers.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("message", "seatNumber cannot be empty");
                        }});
            }
           
            Map<String, Object> result = scheduleService.bookSeats(finalScheduleId, seatNumbers);
            final List<String> finalSeatNumbers = seatNumbers;
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("message", result.get("message"));
                put("scheduleId", finalScheduleId);
                put("seatNumber", finalSeatNumbers);
            }});
        } catch (Exception ex) {
            log.error("Error booking seat", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable String id, @RequestBody Map<String, Object> updateData) {
        try {
            Schedule schedule = scheduleService.updateSchedule(id, updateData);
            return ResponseEntity.ok(schedule);
        } catch (Exception ex) {
            log.error("Error updating schedule: {}", id, ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable String id) {
        try {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Schedule deleted successfully"); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}
 
 