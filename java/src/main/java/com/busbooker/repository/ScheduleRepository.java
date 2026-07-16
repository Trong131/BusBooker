package com.busbooker.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.busbooker.entity.Schedule;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    List<Schedule> findByRouteId(String routeId);
    List<Schedule> findByBusId(String busId);
    List<Schedule> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
