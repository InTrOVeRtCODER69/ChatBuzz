package com.ChatApp.ChatBuzz.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    public ResponseEntity<?> uploadFile(@RequestParam("file")MultipartFile file, Authentication auth) throws IOException {
         String uploadDir="uploads/";
         String fileName= UUID.randomUUID()+"_"+file.getOriginalFilename();
         Path path= Paths.get(uploadDir+fileName);
        Files.createDirectories(path.getParent());
        Files.write(path,file.getBytes());
        String url="/media/"+fileName;
        return ResponseEntity.ok(Collections.singletonMap("url",url));
    }
}
