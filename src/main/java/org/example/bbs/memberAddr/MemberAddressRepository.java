package org.example.bbs.memberAddr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MemberAddressRepository extends JpaRepository<MemberAddrEntity, Long> {

    List<AddressDTO> findByMemId(String memId);

    @Modifying
    @Query("UPDATE AddressEntity a SET a.isPrimary = 'N' WHERE a.memId = :memId")
    void resetPrimaryStatus(@Param("memId") String memId);

    @Modifying
    @Query("UPDATE AddressEntity a SET a.isPrimary = 'Y' WHERE a.addrIdx = :addrIdx")
    void setPrimaryStatus(@Param("addrIdx") Long addrIdx);
}
