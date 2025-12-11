package com.doctorbooking.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyFeedbackRequest {
    @NotBlank(message = "Doctor reply cannot be empty")
    private String doctorReply;
}
