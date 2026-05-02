package org.example.bbs.memberUpdate;

import org.example.bbs.member.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberUpdateRepository extends JpaRepository<MemberEntity, Long> {
    Optional<MemberEntity> findByMemId(String memId);
}