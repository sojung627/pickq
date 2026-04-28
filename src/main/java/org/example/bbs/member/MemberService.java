package org.example.bbs.member;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;

    /**
     * 로그인 인증 로직
     * @param memId 사용자 아이디
     * @param memPwd 사용자 비밀번호
     * @return 인증 성공 시 MemberEntity, 실패 시 null
     */
    public MemberEntity login(String memId, String memPwd) {
        return memberRepository.findByMemId(memId)
                .filter(m -> m.getMemPwd().equals(memPwd))
                .filter(m -> "N".equals(m.getMemIsDeleted())) // 탈퇴 계정 체크 추가
                .orElse(null);
    }

}
