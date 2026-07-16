package com.busbooker.service;
 
import com.busbooker.repository.RouteRepository;
import com.busbooker.repository.ScheduleRepository;
import com.busbooker.entity.Bus;
import com.busbooker.entity.Review;
import com.busbooker.entity.Route;
import com.busbooker.entity.Schedule;
import com.busbooker.repository.BusRepository;
import com.busbooker.repository.ReviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
 
@Service
@Slf4j
public class RouteService {
   
    @Autowired
    private RouteRepository routeRepository;
   
    @Autowired
    private ScheduleRepository scheduleRepository;
   
    @Autowired
    private BusRepository busRepository;
   
    @Autowired
    private ReviewRepository reviewRepository;
   
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }
   
    public Optional<Route> getRouteById(String id) {
        return routeRepository.findById(id);
    }
   
    public List<Route> getRoutesByOriginAndDestination(String origin, String destination) {
        // Try exact match first
        List<Route> routes = routeRepository.findByOriginAndDestination(origin, destination);
        if (routes != null && !routes.isEmpty()) {
            return routes;
        }
 
        try {
            String originRegex = ".*" + java.util.regex.Pattern.quote(origin) + ".*";
            String destinationRegex = ".*" + java.util.regex.Pattern.quote(destination) + ".*";
            routes = routeRepository.findByOriginRegexAndDestinationRegex(originRegex, destinationRegex);
            return routes;
        } catch (Exception ex) {
            log.warn("Regex fallback search failed", ex);
            return java.util.Collections.emptyList();
        }
    }
   
    public Route createRoute(String img, String origin, String destination,
                           Double basisPrice, Double afterDiscount) throws Exception {
        if (origin == null || origin.isEmpty() || destination == null || destination.isEmpty()) {
            throw new Exception("Origin and destination are required");
        }
       
        if (basisPrice == null || basisPrice <= 0) {
            throw new Exception("Basis price must be greater than 0");
        }
       
        Route route = Route.builder()
                .img(img)
                .origin(origin)
                .destination(destination)
                .basisPrice(basisPrice)
                .afterDiscount(afterDiscount)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
       
        return routeRepository.save(route);
    }
   
    public Route updateRoute(String id, Route updateData) throws Exception {
        Optional<Route> routeOpt = routeRepository.findById(id);
        if (!routeOpt.isPresent()) {
            throw new Exception("Route not found");
        }
       
        Route route = routeOpt.get();
       
        if (updateData.getImg() != null) {
            route.setImg(updateData.getImg());
        }
        if (updateData.getOrigin() != null) {
            route.setOrigin(updateData.getOrigin());
        }
        if (updateData.getDestination() != null) {
            route.setDestination(updateData.getDestination());
        }
        if (updateData.getBasisPrice() != null) {
            route.setBasisPrice(updateData.getBasisPrice());
        }
        if (updateData.getAfterDiscount() != null) {
            route.setAfterDiscount(updateData.getAfterDiscount());
        }
       
        route.setUpdatedAt(LocalDateTime.now());
        return routeRepository.save(route);
    }
   
    public Route addScheduleToRoute(String routeId, String scheduleId) throws Exception {
        Optional<Route> routeOpt = routeRepository.findById(routeId);
        if (!routeOpt.isPresent()) {
            throw new Exception("Route not found");
        }
       
        Route route = routeOpt.get();
       
        List<String> scheduleIds = new ArrayList<>();
        Object schedulesObj = route.getSchedules();
        if (schedulesObj != null) {
            if (schedulesObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> schedulesList = (List<Object>) schedulesObj;
                for (Object item : schedulesList) {
                    if (item instanceof String) {
                        scheduleIds.add((String) item);
                    } else if (item instanceof Schedule) {
                        scheduleIds.add(((Schedule) item).getId());
                    } else {
                        scheduleIds.add(item.toString());
                    }
                }
            }
        }
       
        if (scheduleIds.contains(scheduleId)) {
            throw new Exception("Schedule already exists in this route");
        }
       
        scheduleIds.add(scheduleId);
        route.setSchedules(scheduleIds);
        route.setUpdatedAt(LocalDateTime.now());
       
        return routeRepository.save(route);
    }
   
    public void deleteRoute(String id) throws Exception {
        if (!routeRepository.existsById(id)) {
            throw new Exception("Route not found");
        }
        routeRepository.deleteById(id);
    }
   
    public List<Route> searchSchedule(String origin, String destination, String startTime) throws Exception {
        List<Route> routes = getRoutesByOriginAndDestination(origin, destination);
       
        if (routes.isEmpty()) {
            return routes;
        }
       
        for (Route route : routes) {
            Object schedulesObj = route.getSchedules();
            if (schedulesObj == null) {
                continue;
            }
           
            List<String> scheduleIds = new ArrayList<>();
            if (schedulesObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> schedulesList = (List<Object>) schedulesObj;
                for (Object item : schedulesList) {
                    if (item instanceof String) {
                        scheduleIds.add((String) item);
                    } else if (item instanceof Schedule) {
                        scheduleIds.add(((Schedule) item).getId());
                    } else {
                        scheduleIds.add(item.toString());
                    }
                }
            }
           
            if (scheduleIds.isEmpty()) {
                continue;
            }
           
            List<Schedule> populatedSchedules = new ArrayList<>();
            LocalDateTime startOfDay = null;
            LocalDateTime endOfDay = null;
           
            if (startTime != null && !startTime.isEmpty()) {
                try {
                    LocalDateTime startTimeObj;
                    if (startTime.length() == 10 && startTime.matches("\\d{4}-\\d{2}-\\d{2}")) {
                        startTimeObj = LocalDateTime.parse(startTime + "T00:00:00");
                    } else {
                        try {
                            startTimeObj = LocalDateTime.parse(startTime);
                        } catch (Exception e) {
                            startTimeObj = LocalDateTime.parse(startTime.split("T")[0] + "T00:00:00");
                        }
                    }
                   
                    startOfDay = startTimeObj.withHour(0).withMinute(0).withSecond(0).withNano(0);
                    endOfDay = startTimeObj.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                   
                    log.info("Filtering schedules by date: startTime={}, startOfDay={}, endOfDay={}",
                        startTime, startOfDay, endOfDay);
                } catch (Exception ex) {
                    log.error("Error parsing startTime: {}", startTime, ex);
                    startOfDay = null;
                    endOfDay = null;
                }
            }
           
            for (String scheduleId : scheduleIds) {
                Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
                if (scheduleOpt.isPresent()) {
                    Schedule schedule = scheduleOpt.get();
                   
                    if (startOfDay != null && endOfDay != null) {
                        LocalDateTime scheduleStartTime = schedule.getStartTime();
                        if (scheduleStartTime == null) {
                            log.warn("Schedule {} has null startTime, skipping", scheduleId);
                            continue;
                        }
                       

                        boolean isInRange = !scheduleStartTime.isBefore(startOfDay) &&
                                           scheduleStartTime.isBefore(endOfDay);
                       
                        if (!isInRange) {
                            log.debug("Skipping schedule {}: startTime={} not in range [{}, {})",
                                scheduleId, scheduleStartTime, startOfDay, endOfDay);
                            continue;
                        }
                        log.debug("Including schedule {}: startTime={} in range [{}, {})",
                            scheduleId, scheduleStartTime, startOfDay, endOfDay);
                    }
                   
                    // Populate busId and routeId in Schedule (nested populate)
                    populateScheduleReferences(schedule);
                   
                    populatedSchedules.add(schedule);
                }
            }
           
            route.setSchedules(populatedSchedules);
        }
       
        return routes;
    }
   
    private void populateScheduleReferences(Schedule schedule) {
        // Populate busId
        Object busIdObj = schedule.getBusId();
        if (busIdObj != null && !(busIdObj instanceof Bus)) {
            String busIdStr = busIdObj instanceof String ? (String) busIdObj : busIdObj.toString();
            Optional<Bus> busOpt = busRepository.findById(busIdStr);
            if (busOpt.isPresent()) {
                schedule.setBusId(busOpt.get());
            }
        }
       
        Object routeIdObj = schedule.getRouteId();
        if (routeIdObj != null && !(routeIdObj instanceof Route)) {
            String routeIdStr = routeIdObj instanceof String ? (String) routeIdObj : routeIdObj.toString();
            Optional<Route> routeOpt = routeRepository.findById(routeIdStr);
            if (routeOpt.isPresent()) {
                schedule.setRouteId(routeOpt.get());
            }
        }
    }
   
    public Optional<Route> getRouteByIdWithSchedules(String id) {
        Optional<Route> routeOpt = routeRepository.findById(id);
       
        return routeOpt;
    }
}
 