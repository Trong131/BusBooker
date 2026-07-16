package com.busbooker.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.busbooker.entity.Route;

import java.util.List;
import org.springframework.data.mongodb.repository.Query;

@Repository
public interface RouteRepository extends MongoRepository<Route, String> {
    List<Route> findByOriginAndDestination(String origin, String destination);

    @Query("{ '$and': [ { 'origin': { $regex: ?0, $options: 'i' } }, { 'destination': { $regex: ?1, $options: 'i' } } ] }")
    List<Route> findByOriginRegexAndDestinationRegex(String originRegex, String destinationRegex);
}
