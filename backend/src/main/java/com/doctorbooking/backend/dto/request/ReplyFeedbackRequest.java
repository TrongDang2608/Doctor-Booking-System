package com.doctorbooking.backend.dto.request;

import lombok.Data;

@Data
public class ReplyFeedbackRequest {
    private String adminReply;
    private String status;
}
