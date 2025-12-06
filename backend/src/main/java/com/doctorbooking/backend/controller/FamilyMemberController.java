package com.doctorbooking.backend.controller;

import com.doctorbooking.backend.dto.request.CreateFamilyMemberRequest;
import com.doctorbooking.backend.dto.request.UpdateFamilyMemberRequest;
import com.doctorbooking.backend.dto.response.FamilyMemberResponse;
import com.doctorbooking.backend.model.Patient;
import com.doctorbooking.backend.repository.PatientRepository;
import com.doctorbooking.backend.service.FamilyMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class FamilyMemberController {

    private static final Logger logger = LoggerFactory.getLogger(FamilyMemberController.class);

    private final FamilyMemberService familyMemberService;
    private final PatientRepository patientRepository;

    /**
     * Lấy danh sách thành viên gia đình
     */
    @GetMapping("/family-members")
    public ResponseEntity<List<FamilyMemberResponse>> getFamilyMembers(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Patient patient = patientRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            List<FamilyMemberResponse> members = familyMemberService.getFamilyMembers(patient.getId());
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            logger.error("Error getting family members", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy thống kê thành viên gia đình
     */
    @GetMapping("/family-members/stats")
    public ResponseEntity<FamilyMemberService.FamilyStatsResponse> getFamilyStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Patient patient = patientRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            FamilyMemberService.FamilyStatsResponse stats = familyMemberService.getFamilyStats(patient.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting family stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Thêm thành viên gia đình mới
     */
    @PostMapping("/family-members")
    public ResponseEntity<?> createFamilyMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateFamilyMemberRequest request) {
        try {
            Patient patient = patientRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            FamilyMemberResponse response = familyMemberService.createFamilyMember(patient.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            logger.error("Error creating family member", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating family member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create family member");
        }
    }

    /**
     * Cập nhật thành viên gia đình
     */
    @PutMapping("/family-members/{id}")
    public ResponseEntity<?> updateFamilyMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateFamilyMemberRequest request) {
        try {
            Patient patient = patientRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            FamilyMemberResponse response = familyMemberService.updateFamilyMember(patient.getId(), id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error updating family member", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating family member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update family member");
        }
    }

    /**
     * Xóa thành viên gia đình
     */
    @DeleteMapping("/family-members/{id}")
    public ResponseEntity<?> deleteFamilyMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            Patient patient = patientRepository.findByUser_Username(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            familyMemberService.deleteFamilyMember(patient.getId(), id);
            return ResponseEntity.ok().body("Family member deleted successfully");
        } catch (RuntimeException e) {
            logger.error("Error deleting family member", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error deleting family member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete family member");
        }
    }
}

