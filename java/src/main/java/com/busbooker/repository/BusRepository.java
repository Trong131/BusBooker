package com.busbooker.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.busbooker.entity.Bus;

import java.util.List;

@Repository
public interface BusRepository extends MongoRepository<Bus, String> {
    List<Bus> findByStatus(String status);
    List<Bus> findByOwner(String owner);
}
