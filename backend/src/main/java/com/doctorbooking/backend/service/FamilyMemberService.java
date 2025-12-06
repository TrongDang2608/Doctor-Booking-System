package com.doctorbooking.backend.service;

import com.doctorbooking.backend.dto.request.CreateFamilyMemberRequest;
import com.doctorbooking.backend.dto.request.UpdateFamilyMemberRequest;
import com.doctorbooking.backend.dto.response.FamilyMemberResponse;
import com.doctorbooking.backend.model.FamilyMember;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.FamilyMemberRepository;
import com.doctorbooking.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FamilyMemberService {

    private static final Logger logger = LoggerFactory.getLogger(FamilyMemberService.class);

    private final FamilyMemberRepository familyMemberRepository;
    private final PatientRepository patientRepository;

    /**
     * Lấy danh sách tất cả thành viên gia đình
     */
    public List<FamilyMemberResponse> getFamilyMembers(Long patientId) {
        logger.info("Getting family members for patient: {}", patientId);
        
        List<FamilyMember> members = familyMemberRepository.findByMainPatientId(patientId);
        
        logger.info("Found {} family members", members.size());
        return members.stream()
                .map(FamilyMemberResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Tạo thành viên gia đình mới
     */
    @Transactional
    public FamilyMemberResponse createFamilyMember(Long patientId, CreateFamilyMemberRequest request) {
        logger.info("Creating family member for patient: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Kiểm tra nếu đây là main account (SELF) và chưa có
        if (request.getRelationship() == FamilyMember.Relationship.SELF) {
            long mainAccountCount = familyMemberRepository.countMainAccountByPatientId(patientId);
            if (mainAccountCount > 0) {
                throw new RuntimeException("Main account already exists");
            }
        }

        FamilyMember member = new FamilyMember();
        member.setMainPatient(patient);
        member.setFullName(request.getFullName());
        member.setDateOfBirth(request.getDateOfBirth());
        member.setGender(request.getGender());
        member.setRelationship(request.getRelationship());
        member.setPhone(request.getPhone());
        member.setAddress(request.getAddress());
        member.setBloodType(request.getBloodType());
        
        // Store medical history in allergies field for simplicity
        if (request.getMedicalHistory() != null && !request.getMedicalHistory().trim().isEmpty()) {
            member.setAllergies(request.getMedicalHistory());
        }

        // Set isMainAccount if relationship is SELF
        member.setIsMainAccount(request.getRelationship() == FamilyMember.Relationship.SELF);

        FamilyMember saved = familyMemberRepository.save(member);
        logger.info("Family member created successfully: id={}", saved.getId());

        return FamilyMemberResponse.fromEntity(saved);
    }

    /**
     * Cập nhật thành viên gia đình
     */
    @Transactional
    public FamilyMemberResponse updateFamilyMember(Long patientId, Long memberId, UpdateFamilyMemberRequest request) {
        logger.info("Updating family member: memberId={}, patientId={}", memberId, patientId);

        FamilyMember member = familyMemberRepository.findByIdAndMainPatientId(memberId, patientId);
        if (member == null) {
            throw new RuntimeException("Family member not found or access denied");
        }

        // Không cho phép sửa main account
        if (member.getIsMainAccount()) {
            throw new RuntimeException("Cannot update main account");
        }

        // Update fields if provided
        if (request.getFullName() != null) {
            member.setFullName(request.getFullName());
        }
        if (request.getDateOfBirth() != null) {
            member.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            member.setGender(request.getGender());
        }
        if (request.getRelationship() != null) {
            member.setRelationship(request.getRelationship());
        }
        if (request.getPhone() != null) {
            member.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            member.setAddress(request.getAddress());
        }
        if (request.getBloodType() != null) {
            member.setBloodType(request.getBloodType());
        }
        if (request.getMedicalHistory() != null) {
            member.setAllergies(request.getMedicalHistory().trim().isEmpty() ? null : request.getMedicalHistory());
        }

        FamilyMember updated = familyMemberRepository.save(member);
        logger.info("Family member updated successfully: id={}", updated.getId());

        return FamilyMemberResponse.fromEntity(updated);
    }

    /**
     * Xóa thành viên gia đình
     */
    @Transactional
    public void deleteFamilyMember(Long patientId, Long memberId) {
        logger.info("Deleting family member: memberId={}, patientId={}", memberId, patientId);

        FamilyMember member = familyMemberRepository.findByIdAndMainPatientId(memberId, patientId);
        if (member == null) {
            throw new RuntimeException("Family member not found or access denied");
        }

        // Không cho phép xóa main account
        if (member.getIsMainAccount()) {
            throw new RuntimeException("Cannot delete main account");
        }

        familyMemberRepository.delete(member);
        logger.info("Family member deleted successfully: id={}", memberId);
    }

    /**
     * Lấy thống kê về thành viên gia đình
     */
    public FamilyStatsResponse getFamilyStats(Long patientId) {
        long totalMembers = familyMemberRepository.findByMainPatientId(patientId).size();
        long mainAccountCount = familyMemberRepository.countMainAccountByPatientId(patientId);
        long membersWithHistory = familyMemberRepository.countMembersWithMedicalHistory(patientId);

        return new FamilyStatsResponse(totalMembers, mainAccountCount, membersWithHistory);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class FamilyStatsResponse {
        private long totalMembers;
        private long mainAccounts;
        private long membersWithMedicalHistory;
    }
}

