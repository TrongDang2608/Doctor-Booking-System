package com.doctorbooking.backend.dto.response;

import com.doctorbooking.backend.model.FamilyMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberResponse {

    private Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String relationship;
    private String phone;
    private String address;
    private String bloodType;
    private String medicalHistory;
    private Boolean isMainAccount;

    public static FamilyMemberResponse fromEntity(FamilyMember member) {
        if (member == null) {
            return null;
        }

        // Combine allergies and chronic_conditions into medicalHistory for frontend
        String medicalHistory = null;
        if (member.getAllergies() != null && !member.getAllergies().trim().isEmpty()) {
            medicalHistory = member.getAllergies();
        }
        if (member.getChronicConditions() != null && !member.getChronicConditions().trim().isEmpty()) {
            if (medicalHistory != null) {
                medicalHistory += ", " + member.getChronicConditions();
            } else {
                medicalHistory = member.getChronicConditions();
            }
        }

        return FamilyMemberResponse.builder()
                .id(member.getId())
                .fullName(member.getFullName())
                .dateOfBirth(member.getDateOfBirth())
                .gender(member.getGender() != null ? member.getGender().name() : null)
                .relationship(member.getRelationship() != null ? member.getRelationship().name() : null)
                .phone(member.getPhone())
                .address(member.getAddress())
                .bloodType(member.getBloodType())
                .medicalHistory(medicalHistory)
                .isMainAccount(member.getIsMainAccount())
                .build();
    }
}

