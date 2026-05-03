package org.example.bbs.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

    @Transactional
    public Map<String, Object> loginWithLock(String memId, String memPwd) {
        Map<String, Object> result = new HashMap<>();
        Optional<MemberEntity> memberOpt = memberRepository.findByMemId(memId);

        if (memberOpt.isEmpty()) {
            result.put("status", "fail");
            result.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return result;
        }

        MemberEntity member = memberOpt.get();

        // 1. 잠금 상태 확인
        if ("Y".equals(member.getMemLocked())) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(member.getMemLockTime().plusMinutes(5))) {
                // 아직 5분이 안 지났다면 남은 시간 계산
                long secondsLeft = java.time.Duration.between(now, member.getMemLockTime().plusMinutes(5)).getSeconds();
                result.put("status", "locked");
                result.put("message", "5회 실패로 인해 로그인이 제한되었습니다.");
                result.put("remainingSeconds", secondsLeft);
                return result;
            } else {
                // 5분이 지났으면 잠금 해제 및 횟수 초기화
                member.setMemLocked("N");
                member.setMemLoginFailCount(0);
                member.setMemLockTime(null);
                memberRepository.save(member);
            }
        }

        // 2. 비밀번호 검증
        if (passwordEncoder.matches(memPwd, member.getMemPwd())) {
            // 로그인 성공: 실패 횟수 및 잠금 초기화
            member.setMemLoginFailCount(0);
            member.setMemLocked("N");
            member.setMemLockTime(null);
            memberRepository.save(member);

            result.put("status", "success");
            result.put("member", member);
            return result;
        } else {
            // 로그인 실패: 실패 횟수 증가
            int newFailCount = member.getMemLoginFailCount() + 1;
            member.setMemLoginFailCount(newFailCount);

            if (newFailCount >= 5) {
                member.setMemLocked("Y");
                member.setMemLockTime(LocalDateTime.now());
                result.put("status", "locked");
                result.put("message", "5회 실패로 인해 로그인이 제한되었습니다.");
                result.put("remainingSeconds", 300); // 5분
            } else {
                result.put("status", "fail");
                result.put("message", "아이디 혹은 비밀번호가 틀렸습니다 (" + newFailCount + "/5)");
            }
            memberRepository.save(member);
            return result;
        }
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
