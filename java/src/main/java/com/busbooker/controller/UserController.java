package com.busbooker.controller;
 
import com.busbooker.service.UserService;
import com.busbooker.dto.LoginRequest;
import com.busbooker.dto.RegisterRequest;
import com.busbooker.entity.User;
import com.busbooker.dto.LoginResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
 
@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000"})
@Slf4j
public class UserController {
   
    @Autowired
    private UserService userService;
   
    @GetMapping("")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @GetMapping("/infor")
    public ResponseEntity<?> getUserById(@RequestAttribute(required = false) String userId) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{ put("message", "Access token is missing"); }});
            }
           
            Optional<User> user = userService.getUserById(userId);
            if (!user.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "User not found"); }});
            }
           
            return ResponseEntity.ok(user.get());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request.getUsername(), request.getEmail(), request.getPassword());
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String accessToken = userService.login(request.getEmail(), request.getPassword());
            String refreshToken = userService.generateRefreshToken(request.getEmail());
           
            LoginResponse response = LoginResponse.builder()
                    .message("Đăng nhập thành công")
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
           
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessToken(@RequestParam String email) {
        try {
            String newAccessToken = userService.login(email, "");
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("accessToken", newAccessToken); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new HashMap<String, String>() {{
                        put("message", "Refresh token không hợp lệ hoặc đã hết hạn");
                    }});
        }
    }
   
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Đăng xuất thành công"); }});
    }
   

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPass(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            Map<String, Object> result = userService.forgotPassword(email);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Error in forgot password", ex);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   

    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendForgotPasswordEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            userService.sendForgotPasswordEmail(email);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "Email sent successfully"); }});
        } catch (Exception ex) {
            log.error("Error sending forgot password email", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestAttribute(required = false) String userId,
                                           @RequestBody Map<String, String> request) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{ put("message", "Access token is missing"); }});
            }
           
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
           
            User user = userService.changePassword(userId, oldPassword, newPassword);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/reset-pass")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
           
            User user = userService.resetPassword(email, password);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/update-user")
    public ResponseEntity<?> updateUser(@RequestAttribute(required = false) String userId,
                                       @RequestBody User updateData) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{ put("message", "Access token is missing"); }});
            }
           
            User user = userService.updateUser(userId, updateData);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/email")
    public ResponseEntity<?> updateUserByEmail(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            User updateData = new User();
            updateData.setUsername((String) request.get("username"));
            updateData.setPhoneNumber((String) request.get("phoneNumber"));
           
            User user = userService.updateUserByEmail(email, updateData);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/userId/{id}")
    public ResponseEntity<?> updateUserById(@PathVariable String id, @RequestBody User updateData) {
        try {
            User user = userService.updateUser(id, updateData);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @PutMapping("/up-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestAttribute(required = false) String userId,
                                         @RequestParam("avatar") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{ put("message", "Access token is missing"); }});
            }
           
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new HashMap<String, String>() {{ put("message", "Image not found"); }});
            }
           
            String result = userService.uploadAvatar(userId, file);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Client information updated successfully");
            response.put("user", result);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error uploading avatar", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
   
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new HashMap<String, String>() {{ put("message", "User deleted successfully"); }});
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new HashMap<String, String>() {{ put("message", ex.getMessage()); }});
        }
    }
}
 