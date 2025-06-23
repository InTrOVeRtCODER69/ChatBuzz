package com.ChatApp.ChatBuzz.Controller;

import com.ChatApp.ChatBuzz.Model.User;
import com.ChatApp.ChatBuzz.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendRequest(@RequestParam String receiveUsername, Authentication auth) {
        User sender = userRepository.findByUsername(auth.getName()).orElse(null);
        User receiver = userRepository.findByUsername(receiveUsername).orElse(null);

        if (sender == null || receiver == null || sender.equals(receiver)) {
            return ResponseEntity.badRequest().body("Invalid users");
        }

        if (receiver.getReceivedRequests().contains(sender)) {
            return ResponseEntity.badRequest().body("Already sent");
        }

        sender.getSentRequests().add(receiver);
        receiver.getReceivedRequests().add(sender);

        userRepository.save(sender);
        userRepository.save(receiver);

        return ResponseEntity.ok("Request sent");
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptRequest(@RequestParam String senderUsername, Authentication auth) {
        User receiver = userRepository.findByUsername(auth.getName()).orElse(null);
        User sender = userRepository.findByUsername(senderUsername).orElse(null);

        if (receiver == null || sender == null) {
            return ResponseEntity.badRequest().body("Invalid users");
        }

        if (!receiver.getReceivedRequests().contains(sender)) {
            return ResponseEntity.badRequest().body("No request to accept");
        }

        receiver.getReceivedRequests().remove(sender);
        sender.getSentRequests().remove(receiver);

        receiver.getFriends().add(sender);
        sender.getFriends().add(receiver);

        userRepository.save(sender);
        userRepository.save(receiver);

        return ResponseEntity.ok("Request accepted");
    }

    @GetMapping("/sent")
    public ResponseEntity<?> getSentRequests(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        return ResponseEntity.ok(user.getSentRequests());
    }

    @GetMapping("/received")
    public ResponseEntity<?> getReceivedRequests(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        return ResponseEntity.ok(user.getReceivedRequests());
    }

    @GetMapping
    public ResponseEntity<?> getFriends(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }
        return ResponseEntity.ok(user.getFriends());
    }
}
