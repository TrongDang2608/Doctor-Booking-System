package com.doctorbooking.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SymptomCheckRequest {
    @NotBlank(message = "Mô tả triệu chứng không được để trống")
    private String symptoms;
}