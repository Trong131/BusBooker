package com.busbooker.controller;

import com.busbooker.entity.Voucher;
import com.busbooker.service.VoucherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/vouchers")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @GetMapping("")
    public ResponseEntity<?> getAllVouchers() {
        try {
            List<Voucher> vouchers = voucherService.getAllVouchers();
            return ResponseEntity.ok(vouchers);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable String id) {
        try {
            Optional<Voucher> voucher = voucherService.getVoucherById(id);
            if (!voucher.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Voucher not found"); }});
            }
            return ResponseEntity.ok(voucher.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getVoucherByCode(@PathVariable String code) {
        try {
            Optional<Voucher> voucher = voucherService.getVoucherByCode(code);
            if (!voucher.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Voucher not found"); }});
            }
            return ResponseEntity.ok(voucher.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createVoucher(@RequestAttribute(required = false) String userId,
                                          @RequestBody Map<String, Object> request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{ put("message", "Access token is missing"); }});
            }

            String code = (String) request.get("code");
            String name = (String) request.get("name");
            Double discount = ((Number) request.get("discount")).doubleValue();
            String discountType = (String) request.get("discountType");
            LocalDateTime expiryDate = LocalDateTime.parse((String) request.get("expiryDate"));
            String description = (String) request.get("description");
            Integer count = ((Number) request.get("count")).intValue();

            Voucher voucher = voucherService.createVoucher(code, name, discount, discountType, 
                    expiryDate, description, count, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("message", "Voucher created successfully");
                put("voucher", voucher);
            }});
        } catch (Exception ex) {
            log.error("Error creating voucher", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable String id, @RequestBody Voucher updateData) {
        try {
            Voucher voucher = voucherService.updateVoucher(id, updateData);
            return ResponseEntity.ok(voucher);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable String id) {
        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Voucher deleted successfully"); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}
 