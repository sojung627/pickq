package org.example.bbs.member;

import jakarta.servlet.http.HttpSession;
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
    private final SmsService smsService;

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

    // 비밀번호 찾기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 비밀번호 찾기: 아이디 + 전화번호 검증 후 인증번호 SMS 발송
    @Transactional(readOnly = true)
    public Map<String, Object> sendPwdFindAuthCode(String memId, String memTel, HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        Optional<MemberEntity> memberOpt = memberRepository.findByMemId(memId);

        // 아이디 존재 여부 검증
        if (memberOpt.isEmpty()) {
            result.put("idMsg", "존재하지 않는 아이디입니다.");
            return result;
        }

        MemberEntity member = memberOpt.get();

        // 전화번호 일치 여부 검증
        if (!member.getMemTel().equals(memTel)) {
            result.put("telMsg", "전화번호가 일치하지 않습니다.");
            return result;
        }

        // 6자리 인증번호 생성 후 세션 저장
        String authCode = String.valueOf((int)(Math.random() * 900000) + 100000);
        session.setAttribute("pwdFindAuthCode", authCode);
        session.setAttribute("pwdFindMemId", memId);

        // Solapi SMS 발송
        smsService.sendAuthCode(memTel, authCode);

        result.put("verifyMsg", "✔️ 인증번호가 발송되었습니다.");
        return result;
    }

    // 인증 완료된 세션 기준으로 비밀번호 변경
    @Transactional
    public String resetPassword(String authCode, String newPassword, HttpSession session) {
        if (session == null) return "fail";

        Boolean verified = (Boolean) session.getAttribute("pwdFindVerified");
        String memId = (String) session.getAttribute("pwdFindMemId");

        // 인증 완료 여부 및 세션 memId 검증
        if (!Boolean.TRUE.equals(verified) || memId == null) return "fail";

        memberRepository.findByMemId(memId).ifPresent(member -> {
            member.setMemPwd(passwordEncoder.encode(newPassword));
        });

        // 비밀번호 변경 후 관련 세션 데이터 제거
        session.removeAttribute("pwdFindAuthCode");
        session.removeAttribute("pwdFindMemId");
        session.removeAttribute("pwdFindVerified");

        return "success";
    }

    // 새 비밀번호가 현재 비밀번호와 동일한지 확인
    public boolean isSameAsCurrent(String memId, String newPwd) {
        return memberRepository.findByMemId(memId)
                .map(member -> passwordEncoder.matches(newPwd, member.getMemPwd()))
                .orElse(false);
    }

}
