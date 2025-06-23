package com.ChatApp.ChatBuzz.Repository;

import com.ChatApp.ChatBuzz.Model.ChatMessage;
import com.ChatApp.ChatBuzz.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderAndReceiver(User sender, User receiver);
}
