package org.example.bbs.memberUpdate;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberUpdateRepository memberUpdateRepository;
    private final PasswordEncoder passwordEncoder; // 암호화용

    @Transactional
    public boolean updateMemberInfo(MemberUpdateDTO dto) {
        MemberEntity member = memberUpdateRepository.findById(dto.getMemId())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        // 1. 일반 정보 업데이트
        member.setMemName(dto.getMemName());
        member.setMemEmail(dto.getMemEmail());
        member.setMemTel(dto.getMemTel());
        member.setMemBday(dto.getMemBday());

        // 2. 비밀번호 변경 요청이 있는 경우
        if (dto.getNewPwd() != null && !dto.getNewPwd().isEmpty()) {
            // 기존 비번과 동일한지 체크 (선택사항)
            if (passwordEncoder.matches(dto.getNewPwd(), member.getMemPwd())) {
                return false; // 동일한 비번은 변경 불가 처리
            }
            // 새로운 비번 암호화 후 저장
            member.setMemPwd(passwordEncoder.encode(dto.getNewPwd()));
        }

        return true;
    }
}