package org.example.bbs.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;

    // 회원가입 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public MemberEntity signUp(MemberEntity member) {
        member.setMemPwd(passwordEncoder.encode(member.getMemPwd()));
        return memberRepository.save(member);
    }

    // 로그인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    /**
     * 로그인 인증 로직
     * @param memId 사용자 아이디
     * @param memPwd 사용자 비밀번호
     * @return 인증 성공 시 MemberEntity, 실패 시 null
     */
    public MemberEntity login(String memId, String memPwd) {
        return memberRepository.findByMemId(memId)
                .filter(m -> passwordEncoder.matches(memPwd, m.getMemPwd()))
                .orElse(null); // 탈퇴 여부는 Controller에서 체크
    }


    // 로그아웃 및 탈퇴 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 탈퇴
    @Transactional
    public void withdraw(String memId) {
        memberRepository.findByMemId(memId).ifPresent(member -> {
            member.setMemIsDeleted("Y");
            member.setMemDeldate(LocalDateTime.now());
            // save 안 해도 됨 — @Transactional이 변경 감지해서 자동 업데이트
        });
    }

}
