package com.busbooker.service;

import com.busbooker.entity.Review;
import com.busbooker.repository.ReviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Optional<Review> getReviewById(String id) {
        return reviewRepository.findById(id);
    }

    public List<Review> getReviewsByUserId(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    public Review createReview(String userId, String content, Integer rating) throws Exception {
        if (rating < 1 || rating > 5) {
            throw new Exception("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .userId(userId)
                .content(content)
                .rating(rating)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return reviewRepository.save(review);
    }

    public Review updateReview(String id, String content, Integer rating) throws Exception {
        Optional<Review> reviewOpt = reviewRepository.findById(id);
        if (!reviewOpt.isPresent()) {
            throw new Exception("Review not found");
        }

        Review review = reviewOpt.get();

        if (content != null) {
            review.setContent(content);
        }
        if (rating != null) {
            if (rating < 1 || rating > 5) {
                throw new Exception("Rating must be between 1 and 5");
            }
            review.setRating(rating);
        }

        review.setUpdatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public void deleteReview(String id) throws Exception {
        if (!reviewRepository.existsById(id)) {
            throw new Exception("Review not found");
        }
        reviewRepository.deleteById(id);
    }
}
 