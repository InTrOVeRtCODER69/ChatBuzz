package com.ChatApp.ChatBuzz.Repository;

import com.ChatApp.ChatBuzz.Model.Status;
import com.ChatApp.ChatBuzz.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StatusRepository  extends JpaRepository<Status,Long> {
    List<Status> findByUserInAndUploadedAtAfter(List<User> friends, LocalDateTime after);
}
