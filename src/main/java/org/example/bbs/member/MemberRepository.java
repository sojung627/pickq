package org.example.bbs.member;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
    // 아이디를 조건으로 회원 정보 조회
    Optional<MemberEntity> findByMemId(String memId);
}