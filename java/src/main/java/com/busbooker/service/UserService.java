package com.busbooker.service;

import com.busbooker.entity.User;
import com.busbooker.repository.UserRepository;
import com.busbooker.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User register(String username, String email, String password) throws Exception {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new Exception("Email already exists!");
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = User.builder()
                .username(username)
                .email(email)
                .password(hashedPassword)
                .role("Customer")
                .avatar("https://res.cloudinary.com/dzpw9bihb/image/upload/v1726676632/wgbdsrflw8b1vdalkqht.jpg")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    public String login(String email, String password) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new Exception("Email or password is incorrect");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Email or password is incorrect");
        }

        return jwtTokenProvider.generateAccessToken(user.getId(), user.getRole());
    }

    public String generateRefreshToken(String email) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new Exception("User not found");
        }

        User user = userOpt.get();
        return jwtTokenProvider.generateRefreshToken(user.getId(), user.getRole());
    }

    public User updateUser(String id, User updateData) throws Exception {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            throw new Exception("User not found");
        }

        User user = userOpt.get();

        if (updateData.getUsername() != null) {
            user.setUsername(updateData.getUsername());
        }
        if (updateData.getPhoneNumber() != null) {
            user.setPhoneNumber(updateData.getPhoneNumber());
        }
        if (updateData.getAvatar() != null) {
            user.setAvatar(updateData.getAvatar());
        }
        if (updateData.getRole() != null) {
            user.setRole(updateData.getRole());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User changePassword(String id, String oldPassword, String newPassword) throws Exception {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            throw new Exception("User not found");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new Exception("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User resetPassword(String email, String newPassword) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new Exception("Email does not exist!");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void sendForgotPasswordEmail(String email) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new Exception("Email does not exist!");
        }

        String otp = String.format("%06d", (int)(Math.random() * 1000000));
        emailService.sendForgotPasswordEmail(email, otp);
    }

    public void deleteUser(String id) throws Exception {
        if (!userRepository.existsById(id)) {
            throw new Exception("User not found");
        }
        userRepository.deleteById(id);
    }

    public User updateUserByEmail(String email, User updateData) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new Exception("User not found");
        }

        return updateUser(userOpt.get().getId(), updateData);
    }

    public String uploadAvatar(String userId, org.springframework.web.multipart.MultipartFile file) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new Exception("Client not found");
        }

        if (file == null || file.isEmpty()) {
            throw new Exception("Image not found");
        }

        User user = userOpt.get();

        String avatarUrl = cloudinaryService.uploadAvatar(file);
        user.setAvatar(avatarUrl);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return avatarUrl;
    }

    public String updateAvatar(String userId, String avatarUrl) throws Exception {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new Exception("User not found");
        }

        User user = userOpt.get();
        user.setAvatar(avatarUrl);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return avatarUrl;
    }


    public java.util.Map<String, Object> forgotPassword(String email) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new Exception("Email does not exist!");
        }

        int newOTP = 100000 + (int)(Math.random() * 900000);
        java.util.Map<String, Object> otpData = new java.util.HashMap<>();
        otpData.put(String.valueOf(newOTP), email);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("message", "OTP sent successfully!");
        result.put("data", otpData);

        return result;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();
    }
}
 