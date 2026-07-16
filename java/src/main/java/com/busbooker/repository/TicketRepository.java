package com.busbooker.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.busbooker.entity.Ticket;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByUserId(String userId);

    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Ticket> findByScheduleId(String scheduleId);

    List<Ticket> findByStatus(String status);

}

