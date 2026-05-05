package org.example.bbs.memberAddr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MemberAddrRepository extends JpaRepository<MemberAddrEntity, Long> {

    // 1. 엔티티 리스트를 가져와서 서비스에서 DTO로 변환하도록 수정
    List<MemberAddrEntity> findByMember_MemId(String memId);

    @Query("SELECT a FROM MemberAddrEntity a JOIN FETCH a.member WHERE a.member.memId = :memId")
    List<MemberAddrEntity> findAllWithMemberByMemId(@Param("memId") String memId);

    // 2. AddressEntity -> MemberAddrEntity로 수정 (필드명도 member.memId로 정확히 지정)
    @Modifying
    @Query("UPDATE MemberAddrEntity a SET a.isPrimary = 'N' WHERE a.member.memId = :memId")
    void resetPrimaryStatus(@Param("memId") String memId);

    @Modifying
    @Query("UPDATE MemberAddrEntity a SET a.isPrimary = 'Y' WHERE a.addrIdx = :addrIdx")
    void setPrimaryStatus(@Param("addrIdx") Long addrIdx);
}