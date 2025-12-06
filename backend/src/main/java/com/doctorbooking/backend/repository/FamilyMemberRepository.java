package com.doctorbooking.backend.repository;

import com.doctorbooking.backend.model.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    /**
     * Tìm tất cả thành viên gia đình của một bệnh nhân
     */
    @Query("SELECT fm FROM FamilyMember fm WHERE fm.mainPatient.id = :patientId ORDER BY fm.isMainAccount DESC, fm.createdAt ASC")
    List<FamilyMember> findByMainPatientId(@Param("patientId") Long patientId);

    /**
     * Tìm thành viên gia đình theo ID và main patient ID (để verify ownership)
     */
    @Query("SELECT fm FROM FamilyMember fm WHERE fm.id = :id AND fm.mainPatient.id = :patientId")
    FamilyMember findByIdAndMainPatientId(@Param("id") Long id, @Param("patientId") Long patientId);

    /**
     * Kiểm tra xem bệnh nhân đã có main account chưa
     */
    @Query("SELECT COUNT(fm) FROM FamilyMember fm WHERE fm.mainPatient.id = :patientId AND fm.isMainAccount = true")
    long countMainAccountByPatientId(@Param("patientId") Long patientId);

    /**
     * Đếm số thành viên có tiền sử bệnh
     */
    @Query("SELECT COUNT(fm) FROM FamilyMember fm WHERE fm.mainPatient.id = :patientId AND (fm.allergies IS NOT NULL OR fm.chronicConditions IS NOT NULL)")
    long countMembersWithMedicalHistory(@Param("patientId") Long patientId);
}

