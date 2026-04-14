package com.hackconnect.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    @Column
    private String sender;

    @Column
    private String senderId;

    @Column(nullable = false)
    private Long timestampSeconds;
}
