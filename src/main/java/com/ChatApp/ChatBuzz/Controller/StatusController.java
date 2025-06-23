package com.ChatApp.ChatBuzz.Controller;

import com.ChatApp.ChatBuzz.Model.Status;
import com.ChatApp.ChatBuzz.Model.User;
import com.ChatApp.ChatBuzz.Repository.StatusRepository;
import com.ChatApp.ChatBuzz.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/status")
public class StatusController {
    @Autowired
    private StatusRepository statusRepository;
    @Autowired
    private UserRepository userRepository;
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam String mediaUrl, @RequestParam(required=false) String caption, Authentication auth){
        User user=userRepository.findByUsername(auth.getName()).orElseThrow();
        Status status =new Status();
        status.setUser(user);
        status.setMediaUrl(mediaUrl);
        status.setCaption(caption);
        status.setUploadedAt(LocalDateTime.now());
        statusRepository.save(status);
        return ResponseEntity.ok("Status uploaded");
    }
    public ResponseEntity<List<Status>> getFriendsStatus(Authentication auth){
        User user=userRepository.findByUsername(auth.getName()).orElseThrow();
        List<User> friends=new ArrayList<>(user.getFriends());
        LocalDateTime last24hour=LocalDateTime.now().minusHours(24);
        return ResponseEntity.ok(statusRepository.findByUserInAndUploadedAtAfter(friends,last24hour));
    }
}
