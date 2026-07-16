package com.busbooker.controller;

import com.busbooker.entity.Review;
import com.busbooker.service.ReviewService;
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
@RequestMapping("/reviews")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("")
    public ResponseEntity<?> getAllReviews() {
        try {
            List<Review> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable String id) {
        try {
            Optional<Review> review = reviewService.getReviewById(id);
            if (!review.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Review not found"); }});
            }
            return ResponseEntity.ok(review.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PostMapping("")
    public ResponseEntity<?> createReview(@RequestAttribute(required = false) String userId,
                                         @RequestBody Map<String, Object> request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{ put("message", "Access token is missing"); }});
            }

            String content = (String) request.get("content");
            Integer rating = (Integer) request.get("rating");

            Review review = reviewService.createReview(userId, content, rating);
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable String id, @RequestBody Map<String, Object> request) {
        try {
            String content = (String) request.get("content");
            Integer rating = (Integer) request.get("rating");

            Review review = reviewService.updateReview(id, content, rating);
            return ResponseEntity.ok(review);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Review deleted successfully"); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}
 