package com.ChatApp.ChatBuzz.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity


public class User {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)

    private Long id;
    @Setter
    @Getter
    private String username;
    @Getter
    @Setter
    private String email;
    @Setter
    @Getter
    private String password;
    @Getter
    @Setter
    @ManyToMany
    private List<User> friends=new ArrayList<>();
    @Getter
    @Setter
     @ManyToMany
    private List<User> sentRequests=new ArrayList<>();
     @Getter
     @Setter
     @ManyToMany
    private List<User> receivedRequests=new ArrayList<>();

}
