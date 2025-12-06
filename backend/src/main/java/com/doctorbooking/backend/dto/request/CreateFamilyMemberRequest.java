package com.doctorbooking.backend.dto.request;

import com.doctorbooking.backend.model.FamilyMember;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFamilyMemberRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private LocalDate dateOfBirth;

    private FamilyMember.Gender gender;

    @NotNull(message = "Relationship is required")
    private FamilyMember.Relationship relationship;

    private String phone;

    private String address;

    private String bloodType;

    private String medicalHistory; // Will be stored as allergies + chronic_conditions combined
}

