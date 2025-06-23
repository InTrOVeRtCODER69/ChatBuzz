package com.ChatApp.ChatBuzz.Controller;

import com.ChatApp.ChatBuzz.DTO.MessageDTO;
import com.ChatApp.ChatBuzz.Model.ChatMessage;
import com.ChatApp.ChatBuzz.Model.User;
import com.ChatApp.ChatBuzz.Repository.ChatMessageRepository;
import com.ChatApp.ChatBuzz.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate messageTemplate;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ChatMessageRepository messageRepository;
    @MessageMapping("/chat/{to}")
    public void sendMessage(@DestinationVariable String to, MessageDTO messageDTO, Authentication auth){
        User sender=userRepository.findByUsername(auth.getName()).orElse(null);
        User receiver =userRepository.findByUsername(to).orElse(null);

        if(sender==null||receiver==null){
            return;
        }
        ChatMessage message=new ChatMessage();
        message.setContent(messageDTO.getContent());
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setTimestamp(LocalDateTime.now());
        if(messageDTO.getMediaUrl()!=null){
            message.setMediaUrl(messageDTO.getMediaUrl());
            message.setMediaType(messageDTO.getMediaType());
        }


        messageRepository.save(message);
        messageTemplate.convertAndSend("/topic/message"+to,messageDTO);

    }
}
