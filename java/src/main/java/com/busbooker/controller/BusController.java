package com.busbooker.controller;
 
import com.busbooker.entity.Bus;
import com.busbooker.service.BusService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
 
@RestController
@RequestMapping("/bus")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class BusController {
 
    @Autowired
    private BusService busService;
 
    @GetMapping("")
    public ResponseEntity<?> getAllBuses() {
        try {
            List<Bus> buses = busService.getAllBuses();
            return ResponseEntity.ok(buses);
        } catch (Exception ex) {
            log.error("Error getting all buses", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<?> getBusById(@PathVariable String id) {
        try {
            Optional<Bus> bus = busService.getBusById(id);
            if (!bus.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Bus not found"); }});
            }
            return ResponseEntity.ok(bus.get());
        } catch (Exception ex) {
            log.error("Error getting bus by id: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
 
    @PostMapping("/add")
    public ResponseEntity<?> createBus(@RequestBody Map<String, Object> request) {
        try {
            Integer totalSeats = (Integer) request.get("totalSeats");
            String owner = (String) request.get("owner");
            String licensePlate = (String) request.get("licensePlate");
 
            Bus bus = busService.createBus(totalSeats, owner, licensePlate);
            return ResponseEntity.status(HttpStatus.CREATED).body(bus);
        } catch (Exception ex) {
            log.error("Error creating bus", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
 
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateBus(@PathVariable String id, @RequestBody Bus updateData) {
        try {
            Bus bus = busService.updateBus(id, updateData);
            return ResponseEntity.ok(bus);
        } catch (Exception ex) {
            log.error("Error updating bus: {}", id, ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
 
    @PutMapping("/img/{id}")
    public ResponseEntity<?> uploadImages(@PathVariable String id,
                                         @RequestParam("img") MultipartFile[] files) {
        try {
            if (files == null || files.length == 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new HashMap<String, String>() {{
                            put("message", "Không có tệp được tải lên.");
                        }});
            }
 
            Bus bus = busService.uploadImages(id, files);
            if (bus == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{
                            put("message", "Item không tồn tại.");
                        }});
            }
 
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("message", "Tệp được tải lên thành công.");
                put("rss", bus);
            }});
        } catch (Exception ex) {
            log.error("Error uploading images for bus: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBus(@PathVariable String id) {
        try {
            busService.deleteBus(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Bus deleted successfully");
            }});
        } catch (Exception ex) {
            log.error("Error deleting bus: {}", id, ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
 
    @GetMapping("/review/{id}")
    public ResponseEntity<?> getBusReviews(@PathVariable String id) {
        try {

            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("message", "Not implemented yet");
            }});
        } catch (Exception ex) {
            log.error("Error getting bus reviews: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}