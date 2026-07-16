package com.busbooker.service;
 
import com.busbooker.repository.ScheduleRepository;
import com.busbooker.entity.Bus;
import com.busbooker.entity.Route;
import com.busbooker.entity.Schedule;
import com.busbooker.repository.BusRepository;
import com.busbooker.repository.RouteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
 
@Service
@Slf4j
public class ScheduleService {
   
    @Autowired
    private ScheduleRepository scheduleRepository;
   
    @Autowired
    private BusRepository busRepository;
   
    @Autowired
    private RouteRepository routeRepository;
   
    public List<Schedule> getAllSchedules() {
        List<Schedule> schedules = scheduleRepository.findAll();
        for (Schedule schedule : schedules) {
            populateScheduleReferences(schedule);
        }
        return schedules;
    }
   
    public Optional<Schedule> getScheduleById(String id) {
        Optional<Schedule> scheduleOpt = scheduleRepository.findById(id);
        if (scheduleOpt.isPresent()) {
            populateScheduleReferences(scheduleOpt.get());
        }
        return scheduleOpt;
    }
   
    public List<Schedule> getSchedulesByRouteId(String routeId) {
        List<Schedule> schedules = scheduleRepository.findByRouteId(routeId);
        for (Schedule schedule : schedules) {
            populateScheduleReferences(schedule);
        }
        return schedules;
    }
   
    private void populateScheduleReferences(Schedule schedule) {
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
   
    public List<Schedule> getSchedulesByDate(String startTime) {
        if (startTime == null || startTime.isEmpty()) {
            return getAllSchedules();
        }
       
        try {
            LocalDateTime date = LocalDateTime.parse(startTime);
            LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = date.withHour(23).withMinute(59).withSecond(59);
            return scheduleRepository.findByStartTimeBetween(startOfDay, endOfDay);
        } catch (Exception ex) {
            log.error("Error parsing startTime: {}", startTime, ex);
            return getAllSchedules();
        }
    }
   
    public List<Schedule> getSchedulesByDate(LocalDateTime date) {
        LocalDateTime startOfDay = date.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = date.withHour(23).withMinute(59).withSecond(59);
        return scheduleRepository.findByStartTimeBetween(startOfDay, endOfDay);
    }
   
    public Schedule createSchedule(String busId, String routeId, LocalDateTime startTime,
                                   LocalDateTime endTime, java.util.Map<String, Double> priceMap) throws Exception {
        Optional<Bus> busOpt = busRepository.findById(busId);
        if (!busOpt.isPresent()) {
            throw new Exception("Bus not found");
        }
       
        Bus bus = busOpt.get();
        Integer totalSeats = bus.getTotalSeats();
       
        List<Schedule.Seat> seats = createSeats(totalSeats, priceMap);
       
        Schedule schedule = Schedule.builder()
                .busId(busId)
                .routeId(routeId)
                .startTime(startTime)
                .endTime(endTime)
                .availableSeats(totalSeats)
                .seats(seats)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
       
        Schedule savedSchedule = scheduleRepository.save(schedule);
       
        try {
            Optional<Route> routeOpt = routeRepository.findById(routeId);
            if (routeOpt.isPresent()) {
                Route route = routeOpt.get();
               
                List<String> scheduleIds = new ArrayList<>();
                Object schedulesObj = route.getSchedules();
                if (schedulesObj != null && schedulesObj instanceof List) {
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
               
                if (!scheduleIds.contains(savedSchedule.getId())) {
                    scheduleIds.add(savedSchedule.getId());
                    route.setSchedules(scheduleIds);
                    routeRepository.save(route);
                }
            }
        } catch (Exception ex) {
            log.warn("Could not add schedule to route", ex);
        }
       
        return savedSchedule;
    }
   
    private List<Schedule.Seat> createSeats(Integer totalSeats, java.util.Map<String, Double> priceMap) {
        List<Schedule.Seat> seats = new ArrayList<>();
       
        Double frontPrice = priceMap.getOrDefault("front", 0.0);
        Double middlePrice = priceMap.getOrDefault("middle", 0.0);
        Double backPrice = priceMap.getOrDefault("back", 0.0);
       
        // Chia ghế thành 3 phần: front, middle, back
        int thirdOfTotal = (int) Math.ceil(totalSeats / 3.0);
        int twoThirds = thirdOfTotal * 2;
        
        for (int i = 1; i <= totalSeats; i++) {
            String location;
            Double price;
            
            if (i <= thirdOfTotal) {
                // Front seats
                location = "front";
                price = frontPrice;
            } else if (i <= twoThirds) {
                // Middle seats
                location = "middle";
                price = middlePrice;
            } else {
                // Back seats
                location = "back";
                price = backPrice;
            }
            
            seats.add(Schedule.Seat.builder()
                    .seatNumber("S" + i)
                    .isBooked(false)
                    .location(location)
                    .price(price)
                    .build());
        }
       
        return seats;
    }
   
    public java.util.Map<String, Object> bookSeats(String scheduleId, List<String> seatNumbers) throws Exception {
        if (scheduleId == null || scheduleId.isEmpty()) {
            throw new Exception("Schedule ID cannot be null or empty");
        }
       
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            throw new Exception("Seat numbers cannot be null or empty");
        }
       
        log.info("Booking seats: scheduleId={}, seatNumbers={}", scheduleId, seatNumbers);
       
        Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
        if (!scheduleOpt.isPresent()) {
            throw new Exception("Schedule not found with ID: " + scheduleId);
        }
       
        Schedule schedule = scheduleOpt.get();
        List<String> bookedSeats = new ArrayList<>();
       
        for (String seatNum : seatNumbers) {
            Schedule.Seat seat = schedule.getSeats().stream()
                    .filter(s -> s.getSeatNumber().equals(seatNum))
                    .findFirst()
                    .orElseThrow(() -> new Exception("Seat " + seatNum + " not found"));
           
            if (seat.getIsBooked()) {
                throw new Exception("Seat " + seatNum + " is already booked");
            }
           
            seat.setIsBooked(true);
            schedule.setAvailableSeats(schedule.getAvailableSeats() - 1);
            bookedSeats.add(seatNum);
        }
       
        schedule.setUpdatedAt(LocalDateTime.now());
        scheduleRepository.save(schedule);
       
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("message", "Seat " + seatNumbers + " has been successfully booked");
        result.put("scheduleId", scheduleId);
        result.put("seatNumber", seatNumbers);
        return result;
    }
   
    public Schedule updateSchedule(String id, java.util.Map<String, Object> updateData) throws Exception {
        Optional<Schedule> scheduleOpt = scheduleRepository.findById(id);
        if (!scheduleOpt.isPresent()) {
            throw new Exception("Schedule not found");
        }
       
        Schedule schedule = scheduleOpt.get();
       
        if (updateData.containsKey("startTime")) {
            schedule.setStartTime(LocalDateTime.parse((String) updateData.get("startTime")));
        }
        if (updateData.containsKey("endTime")) {
            schedule.setEndTime(LocalDateTime.parse((String) updateData.get("endTime")));
        }
       
        schedule.setUpdatedAt(LocalDateTime.now());
        return scheduleRepository.save(schedule);
    }
   
    public void deleteSchedule(String id) throws Exception {
        if (!scheduleRepository.existsById(id)) {
            throw new Exception("Schedule not found");
        }
        scheduleRepository.deleteById(id);
    }
}
 
 