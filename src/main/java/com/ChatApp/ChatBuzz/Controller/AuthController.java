package com.ChatApp.ChatBuzz.Controller;

import com.ChatApp.ChatBuzz.DTO.LoginRequest;
import com.ChatApp.ChatBuzz.DTO.SignUpRequest;
import com.ChatApp.ChatBuzz.Model.User;
import com.ChatApp.ChatBuzz.Repository.UserRepository;
import com.ChatApp.ChatBuzz.SecurityConfig.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;



import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;


    @PostMapping("/signup")
    public ResponseEntity<?> registerByUsername(@RequestBody SignUpRequest request){
        if(userRepository.existsByUsername(request.getUsername())){
            return ResponseEntity.badRequest().body("Username already taken");
        }
        if(userRepository.existsByEmail(request.getEmail())){
            return ResponseEntity.badRequest().body("Email already in Use");
        }
        User user=new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody  LoginRequest request){
        Optional<User> optionalUser=userRepository.findByUsername(request.getUsername());
        if(optionalUser.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Username");
        }
        User user= optionalUser.get();
        if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }
        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(Collections.singletonMap("token",token));
    }
}
