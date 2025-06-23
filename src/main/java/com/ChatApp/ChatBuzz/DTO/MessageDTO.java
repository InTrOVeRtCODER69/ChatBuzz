package com.ChatApp.ChatBuzz.DTO;

import lombok.Getter;
import lombok.Setter;

public class MessageDTO {
    @Getter
    @Setter
    private String content;
    @Getter
    @Setter
    private String sender;
    @Getter
    @Setter
    private String receiver;
    @Getter
    @Setter
    private String mediaUrl;
    @Getter
    @Setter
    private String mediaType;

}
