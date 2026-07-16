package com.busbooker.service;

import com.busbooker.entity.Voucher;
import com.busbooker.repository.VoucherRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    public Optional<Voucher> getVoucherById(String id) {
        return voucherRepository.findById(id);
    }

    public Optional<Voucher> getVoucherByCode(String code) {
        return voucherRepository.findByCode(code);
    }

    public List<Voucher> getVouchersByCreatedBy(String userId) {
        return voucherRepository.findByCreatedBy(userId);
    }

    public Voucher createVoucher(String code, String name, Double discount, String discountType,
                                LocalDateTime expiryDate, String description, Integer count, 
                                String createdBy) throws Exception {
        if (code == null || code.isEmpty()) {
            throw new Exception("Voucher code is required");
        }

        if (voucherRepository.findByCode(code).isPresent()) {
            throw new Exception("Voucher code already exists");
        }

        Voucher voucher = Voucher.builder()
                .code(code)
                .name(name)
                .discount(discount)
                .discountType(discountType)
                .expiryDate(expiryDate)
                .description(description)
                .count(count)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return voucherRepository.save(voucher);
    }

    public Voucher updateVoucher(String id, Voucher updateData) throws Exception {
        Optional<Voucher> voucherOpt = voucherRepository.findById(id);
        if (!voucherOpt.isPresent()) {
            throw new Exception("Voucher not found");
        }

        Voucher voucher = voucherOpt.get();

        if (updateData.getCode() != null) {
            voucher.setCode(updateData.getCode());
        }
        if (updateData.getName() != null) {
            voucher.setName(updateData.getName());
        }
        if (updateData.getDiscount() != null) {
            voucher.setDiscount(updateData.getDiscount());
        }
        if (updateData.getCount() != null) {
            voucher.setCount(updateData.getCount());
        }

        voucher.setUpdatedAt(LocalDateTime.now());
        return voucherRepository.save(voucher);
    }

    public void deleteVoucher(String id) throws Exception {
        if (!voucherRepository.existsById(id)) {
            throw new Exception("Voucher not found");
        }
        voucherRepository.deleteById(id);
    }
}
 