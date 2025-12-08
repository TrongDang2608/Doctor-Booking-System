package com.doctorbooking.backend.dto.request;

import com.doctorbooking.backend.model.FamilyMember;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFamilyMemberRequest {

    private String fullName;

    private LocalDate dateOfBirth;

    private FamilyMember.Gender gender;

    private FamilyMember.Relationship relationship;

    private String phone;

    private String address;

    private String bloodType;

    private String medicalHistory;
}

