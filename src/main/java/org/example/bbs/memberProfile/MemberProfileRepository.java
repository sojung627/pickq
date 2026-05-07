package org.example.bbs.memberProfile;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberProfileRepository extends JpaRepository<MemberProfileEntity, Long> {
    Optional<MemberProfileEntity> findByMember_MemId(String memId);
}
