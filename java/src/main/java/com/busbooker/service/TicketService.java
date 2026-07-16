package com.busbooker.service;

import com.busbooker.repository.TicketRepository;
import com.busbooker.repository.ScheduleRepository;
import com.busbooker.entity.Bus;
import com.busbooker.entity.Review;
import com.busbooker.entity.Route;
import com.busbooker.entity.Schedule;
import com.busbooker.entity.Ticket;
import com.busbooker.repository.BusRepository;
import com.busbooker.repository.RouteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private BusRepository busRepository;
    
    @Autowired
    private RouteRepository routeRepository;

    public List<Ticket> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        
        for (Ticket ticket : tickets) {
            populateTicketReferences(ticket);
        }
        
        return tickets;
    }

    public Optional<Ticket> getTicketById(String id) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isPresent()) {
            populateTicketReferences(ticketOpt.get());
        }
        return ticketOpt;
    }


    public List<Ticket> getTicketsByUserIdWithAutoUpdate(String userId) throws Exception {
   
        List<Ticket> tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        LocalDateTime currentTime = LocalDateTime.now();
        boolean hasUpdates = false;

        for (Ticket ticket : tickets) {
            populateTicketReferences(ticket);

            if (ticket.getScheduleId() != null && ticket.getScheduleId() instanceof Schedule) {
                Schedule schedule = (Schedule) ticket.getScheduleId();
                LocalDateTime departureStartTime = schedule.getStartTime();

                if (departureStartTime.isBefore(currentTime) && 
                    !"completed".equals(ticket.getStatus())) {
                    ticket.setStatus("completed");
                    ticket.setUpdatedAt(LocalDateTime.now());
                    ticketRepository.save(ticket);
                    hasUpdates = true;
                }
            }
        }

        if (hasUpdates) {
            tickets = ticketRepository.findByUserIdOrderByCreatedAtDesc(userId);
            for (Ticket ticket : tickets) {
                populateTicketReferences(ticket);
            }
        }

        return tickets;
    }

    public List<Ticket> getTicketsByUserId(String userId) throws Exception {
        return getTicketsByUserIdWithAutoUpdate(userId);
    }

    public List<Ticket> getTicketsByScheduleId(String scheduleId) {
        return ticketRepository.findByScheduleId(scheduleId);
    }

    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatus(status);
    }

    public Ticket createTicket(String userId, String scheduleId, List<String> seatNumbers,
                              Double price, String paymentMethod, String phoneNumber,
                              String email, String username, String status, String voucher) throws Exception {
        if (status == null || status.isEmpty()) {
            status = "waiting";
        }

        Ticket ticket = Ticket.builder()
                .userId(userId)
                .scheduleId(scheduleId)
                .seatNumbers(seatNumbers)
                .price(price)
                .paymentMethod(paymentMethod)
                .phoneNumber(phoneNumber)
                .email(email)
                .username(username)
                .status(status)
                .voucher(voucher) // Thêm voucher
                .hasReviewed(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return ticketRepository.save(ticket);
    }

    public Ticket createTicket(String userId, String scheduleId, List<String> seatNumbers,
                              Double price, String paymentMethod, String phoneNumber,
                              String email, String username) throws Exception {
        return createTicket(userId, scheduleId, seatNumbers, price, paymentMethod, 
                          phoneNumber, email, username, "waiting", null);
    }

    public Ticket updateTicketStatus(String id, String status) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }

        Ticket ticket = ticketOpt.get();
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(String id, Ticket updateData) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }

        Ticket ticket = ticketOpt.get();

        if (updateData.getStatus() != null) {
            ticket.setStatus(updateData.getStatus());
        }
        if (updateData.getVoucher() != null) {
            ticket.setVoucher(updateData.getVoucher());
        }
        if (updateData.getHasReviewed() != null) {
            ticket.setHasReviewed(updateData.getHasReviewed());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id) throws Exception {
        if (!ticketRepository.existsById(id)) {
            throw new Exception("Ticket not found");
        }
        ticketRepository.deleteById(id);
    }

    public Ticket cancelTicket(String ticketId) throws Exception {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent()) {
            throw new Exception("Ticket not found");
        }

        Ticket ticket = ticketOpt.get();
        ticket.setStatus("cancelled");

        if (ticket.getScheduleId() != null && ticket.getSeatNumbers() != null) {
            String scheduleIdStr;
            Object scheduleIdObj = ticket.getScheduleId();

            if (scheduleIdObj instanceof String) {
                scheduleIdStr = (String) scheduleIdObj;
            } else if (scheduleIdObj instanceof Schedule) {
                scheduleIdStr = ((Schedule) scheduleIdObj).getId();
            } else {
                scheduleIdStr = scheduleIdObj.toString();
            }

            Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleIdStr);
            if (scheduleOpt.isPresent()) {
                Schedule schedule = scheduleOpt.get();

                for (String seatNumber : ticket.getSeatNumbers()) {
                    if (schedule.getSeats() != null) {
                        for (Schedule.Seat seat : schedule.getSeats()) {
                            if (seat.getSeatNumber().equals(seatNumber) && seat.getIsBooked()) {
                                seat.setIsBooked(false);
                                schedule.setAvailableSeats(schedule.getAvailableSeats() + 1);
                                break;
                            }
                        }
                    }
                }

                schedule.setUpdatedAt(LocalDateTime.now());
                scheduleRepository.save(schedule);
            }
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Bus addReview(String userId, String content, Integer rating,
                        String busId, String ticketId) throws Exception {
        Review review = reviewService.createReview(userId, content, rating);

        Optional<Bus> busOpt = busRepository.findById(busId);
        if (!busOpt.isPresent()) {
            throw new Exception("Bus không tồn tại");
        }

        Bus bus = busOpt.get();
        if (bus.getReviews() == null) {
            bus.setReviews(new java.util.ArrayList<>());
        }
        bus.getReviews().add(review.getId());
        bus.setUpdatedAt(LocalDateTime.now());
        bus = busRepository.save(bus);

        if (ticketId != null) {
            Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
            if (ticketOpt.isPresent()) {
                Ticket ticket = ticketOpt.get();
                ticket.setHasReviewed(true);
                ticket.setUpdatedAt(LocalDateTime.now());
                ticketRepository.save(ticket);
            }
        }

        return bus;
    }

    private void populateTicketReferences(Ticket ticket) {
        Object scheduleIdObj = ticket.getScheduleId();
        if (scheduleIdObj != null && !(scheduleIdObj instanceof Schedule)) {
            String scheduleIdStr = scheduleIdObj instanceof String ? (String) scheduleIdObj : scheduleIdObj.toString();
            Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleIdStr);
            if (scheduleOpt.isPresent()) {
                Schedule schedule = scheduleOpt.get();

                Object routeIdObj = schedule.getRouteId();
                if (routeIdObj != null && !(routeIdObj instanceof Route)) {
                    String routeIdStr = routeIdObj instanceof String ? (String) routeIdObj : routeIdObj.toString();
                    Optional<Route> routeOpt = routeRepository.findById(routeIdStr);
                    if (routeOpt.isPresent()) {
                        schedule.setRouteId(routeOpt.get());
                    }
                }

                Object busIdObj = schedule.getBusId();
                if (busIdObj != null && !(busIdObj instanceof Bus)) {
                    String busIdStr = busIdObj instanceof String ? (String) busIdObj : busIdObj.toString();
                    Optional<Bus> busOpt = busRepository.findById(busIdStr);
                    if (busOpt.isPresent()) {
                        schedule.setBusId(busOpt.get());
                    }
                }

                ticket.setScheduleId(schedule); 
            }
        } else if (scheduleIdObj instanceof Schedule) {
            Schedule schedule = (Schedule) scheduleIdObj;

            Object routeIdObj = schedule.getRouteId();
            if (routeIdObj != null && !(routeIdObj instanceof Route)) {
                String routeIdStr = routeIdObj instanceof String ? (String) routeIdObj : routeIdObj.toString();
                Optional<Route> routeOpt = routeRepository.findById(routeIdStr);
                if (routeOpt.isPresent()) {
                    schedule.setRouteId(routeOpt.get());
                }
            }

            Object busIdObj = schedule.getBusId();
            if (busIdObj != null && !(busIdObj instanceof Bus)) {
                String busIdStr = busIdObj instanceof String ? (String) busIdObj : busIdObj.toString();
                Optional<Bus> busOpt = busRepository.findById(busIdStr);
                if (busOpt.isPresent()) {
                    schedule.setBusId(busOpt.get());
                }
            }
        }
    }
}

