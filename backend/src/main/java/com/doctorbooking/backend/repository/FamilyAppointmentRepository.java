package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.FamilyAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyAppointmentRepository extends JpaRepository<FamilyAppointment, Long> {

    /**
     * Tìm family appointment theo appointment ID
     */
    Optional<FamilyAppointment> findByAppointmentId(Long appointmentId);

    /**
     * Tìm tất cả family appointments của một patient (người đặt lịch)
     */
    @Query("SELECT fa FROM FamilyAppointment fa WHERE fa.bookedByPatient.id = :patientId")
    List<FamilyAppointment> findByBookedByPatientId(@Param("patientId") Long patientId);

    /**
     * Tìm family appointments của một family member
     */
    @Query("SELECT fa FROM FamilyAppointment fa WHERE fa.familyMember.id = :familyMemberId")
    List<FamilyAppointment> findByFamilyMemberId(@Param("familyMemberId") Long familyMemberId);
}

