package com.ChatApp.ChatBuzz.Controller;

import com.ChatApp.ChatBuzz.Model.ChatMessage;
import com.ChatApp.ChatBuzz.Model.User;
import com.ChatApp.ChatBuzz.Repository.ChatMessageRepository;
import com.ChatApp.ChatBuzz.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/history/{withUser}")
    public ResponseEntity<?> getChatHistory(@PathVariable String withUser, Authentication auth) {
        User currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
        User otherUser = userRepository.findByUsername(withUser).orElse(null);

        if (currentUser == null || otherUser == null) {
            return ResponseEntity.badRequest().body("Invalid user(s)");
        }

        List<ChatMessage> history = messageRepository.findBySenderAndReceiver(currentUser, otherUser);
        history.addAll(messageRepository.findBySenderAndReceiver(otherUser, currentUser));
        history.sort(Comparator.comparing(ChatMessage::getTimestamp)); // Sort by time

        return ResponseEntity.ok(history);
    }
}
