package com.busbooker.service;

import com.busbooker.entity.Bus;
import com.busbooker.repository.BusRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class BusService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Optional<Bus> getBusById(String id) {
        return busRepository.findById(id);
    }

    public List<Bus> getBusByOwner(String owner) {
        return busRepository.findByOwner(owner);
    }

    public List<Bus> getBusByStatus(String status) {
        return busRepository.findByStatus(status);
    }

    public Bus createBus(Integer totalSeats, String owner, String licensePlate) throws Exception {
        if (totalSeats == null || totalSeats <= 0) {
            throw new Exception("Total seats must be greater than 0");
        }

        Bus bus = Bus.builder()
                .totalSeats(totalSeats)
                .owner(owner)
                .licensePlate(licensePlate)
                .status("active")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return busRepository.save(bus);
    }

    public Bus updateBus(String id, Bus updateData) throws Exception {
        Optional<Bus> busOpt = busRepository.findById(id);
        if (!busOpt.isPresent()) {
            throw new Exception("Bus not found");
        }

        Bus bus = busOpt.get();

        if (updateData.getTotalSeats() != null) {
            bus.setTotalSeats(updateData.getTotalSeats());
        }
        if (updateData.getStatus() != null) {
            bus.setStatus(updateData.getStatus());
        }
        if (updateData.getLicensePlate() != null) {
            bus.setLicensePlate(updateData.getLicensePlate());
        }

        bus.setUpdatedAt(LocalDateTime.now());
        return busRepository.save(bus);
    }

    // Upload images using MultipartFile[] and Cloudinary
    public Bus uploadImages(String id, org.springframework.web.multipart.MultipartFile[] files) throws Exception {
        Optional<Bus> busOpt = busRepository.findById(id);
        if (!busOpt.isPresent()) {
            return null; // Return null để Controller trả về 404
        }

        Bus bus = busOpt.get();

        if (files == null || files.length == 0) {
            throw new Exception("Không có tệp được tải lên.");
        }

        // Upload files to Cloudinary
        List<String> imageUrls = cloudinaryService.uploadFiles(files);
        bus.setImg(imageUrls);
        bus.setUpdatedAt(LocalDateTime.now());

        return busRepository.save(bus);
    }

    // Helper method để upload lên Cloudinary (cần implement)
    public Bus uploadImages(String id, List<String> imageUrls) throws Exception {
        Optional<Bus> busOpt = busRepository.findById(id);
        if (!busOpt.isPresent()) {
            throw new Exception("Bus not found");
        }

        Bus bus = busOpt.get();
        bus.setImg(imageUrls);
        bus.setUpdatedAt(LocalDateTime.now());
        return busRepository.save(bus);
    }

    public void deleteBus(String id) throws Exception {
        if (!busRepository.existsById(id)) {
            throw new Exception("Bus not found");
        }
        busRepository.deleteById(id);
    }
}
 