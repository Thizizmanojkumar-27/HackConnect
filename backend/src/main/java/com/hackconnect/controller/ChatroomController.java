package com.hackconnect.controller;

import com.hackconnect.model.ChatMessage;
import com.hackconnect.model.Chatroom;
import com.hackconnect.repository.ChatMessageRepository;
import com.hackconnect.repository.ChatroomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chatrooms")
public class ChatroomController {

    @Autowired
    private ChatroomRepository chatroomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @GetMapping
    public ResponseEntity<List<Chatroom>> getAllRooms() {
        return ResponseEntity.ok(chatroomRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Chatroom> createRoom(@RequestBody Chatroom room) {
        room.setCreatedAt(System.currentTimeMillis());
        Chatroom savedRoom = chatroomRepository.save(room);
        return ResponseEntity.ok(savedRoom);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        if (!chatroomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Delete all messages in the room first
        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampSecondsAsc(id);
        chatMessageRepository.deleteAll(messages);
        
        // Delete the room
        chatroomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> getRoomMessages(@PathVariable Long roomId) {
        if (!chatroomRepository.existsById(roomId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(chatMessageRepository.findByRoomIdOrderByTimestampSecondsAsc(roomId));
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<ChatMessage> broadcastMessage(@PathVariable Long roomId, @RequestBody ChatMessage message) {
        if (!chatroomRepository.existsById(roomId)) {
            return ResponseEntity.notFound().build();
        }
        
        message.setRoomId(roomId);
        message.setTimestampSeconds(System.currentTimeMillis() / 1000);
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        return ResponseEntity.ok(savedMessage);
    }
}
