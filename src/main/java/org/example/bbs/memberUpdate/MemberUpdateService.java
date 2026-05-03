package org.example.bbs.memberUpdate;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberUpdateService {

    private final MemberUpdateRepository memberUpdateRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void updateMemberInfo(MemberUpdateDTO dto) {
        MemberEntity member = memberUpdateRepository.findByMemId(dto.getMemId())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        member.setMemName(dto.getMemName());
        member.setMemEmail(dto.getMemEmail());
        member.setMemTel(dto.getMemTel());
        member.setMemBday(dto.getMemBday());

        if (dto.getNewPwd() != null && !dto.getNewPwd().isEmpty()) {
            member.setMemPwd(passwordEncoder.encode(dto.getNewPwd()));
        }
    }

    public boolean isSamePassword(String rawPwd, String encodedPwd) {
        return passwordEncoder.matches(rawPwd, encodedPwd);
    }
}