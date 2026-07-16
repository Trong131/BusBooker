package com.busbooker.controller;

import com.busbooker.entity.Route;
import com.busbooker.service.RouteService;
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
@RequestMapping("/routes")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping("")
    public ResponseEntity<?> getAllRoutes() {
        try {
            List<Route> routes = routeService.getAllRoutes();
            return ResponseEntity.ok(routes);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRouteById(@PathVariable String id) {
        try {
            Optional<Route> route = routeService.getRouteById(id);
            if (!route.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Route not found"); }});
            }
            return ResponseEntity.ok(route.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    // Frontend gọi GET /routes/find-schedule?origin=...&destination=...&startTime=...
    @GetMapping("/find-schedule")
    public ResponseEntity<?> searchSchedule(@RequestParam(required = false) String startTime,
                                            @RequestParam String origin,
                                            @RequestParam String destination) {
        try {
            List<Route> routes = routeService.searchSchedule(origin, destination, startTime);
            return ResponseEntity.ok(routes);
        } catch (Exception ex) {
            log.error("Error searching schedule", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    // Frontend gọi GET /routes/get-route/:id
    @GetMapping("/get-route/{id}")
    public ResponseEntity<?> getRouteByIdWithSchedules(@PathVariable String id) {
        try {
            Optional<Route> route = routeService.getRouteByIdWithSchedules(id);
            if (!route.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Route not found"); }});
            }
            return ResponseEntity.ok(route.get());
        } catch (Exception ex) {
            log.error("Error getting route by id: {}", id, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PostMapping("")
    public ResponseEntity<?> createRoute(@RequestBody Map<String, Object> request) {
        try {
            String img = (String) request.get("img");
            String origin = (String) request.get("origin");
            String destination = (String) request.get("destination");
            Object basisPriceObj = request.get("basisPrice");
            Double basisPrice = Double.parseDouble(basisPriceObj.toString());

            Object afterDiscountObj = request.get("afterDiscount");
            Double afterDiscount = afterDiscountObj != null
                    ? Double.parseDouble(afterDiscountObj.toString())
                    : null;

            Route route = routeService.createRoute(img, origin, destination, basisPrice, afterDiscount);
            return ResponseEntity.status(HttpStatus.CREATED).body(route);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable String id, @RequestBody Route updateData) {
        try {
            Route route = routeService.updateRoute(id, updateData);
            return ResponseEntity.ok(route);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    // Frontend gọi POST /routes/push-schedule/
    @PostMapping("/push-schedule/")
    public ResponseEntity<?> updateRouteBySchedule(@RequestBody Map<String, String> request) {
        try {
            String routeId = request.get("routeId");
            String scheduleId = request.get("scheduleId");

            Route route = routeService.addScheduleToRoute(routeId, scheduleId);
            return ResponseEntity.ok(route);
        } catch (Exception ex) {
            log.error("Error updating route by schedule", ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable String id) {
        try {
            routeService.deleteRoute(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Route deleted successfully"); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}
 