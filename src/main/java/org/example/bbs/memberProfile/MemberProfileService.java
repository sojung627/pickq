package org.example.bbs.memberProfile;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

    private final MemberProfileRepository memberProfileRepository;
    private final MemberRepository memberRepository;

    // 프로필 조회
    public MemberProfileEntity getProfile(String memId) {
        return memberProfileRepository.findByMember_MemId(memId)
                .orElse(null);
    }

    // 프로필 저장/수정
    @Transactional
    public void saveProfile(String memId, String memNickname, String memIntro, MultipartFile memImgFile) throws IOException {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        MemberProfileEntity profile = memberProfileRepository.findByMember_MemId(memId)
                .orElseGet(() -> {
                    MemberProfileEntity newProfile = MemberProfileEntity.builder()
                            .member(member)
                            .build();
                    return memberProfileRepository.save(newProfile); // 먼저 저장
                });

        profile.setMemNickname(memNickname);
        profile.setMemIntro(memIntro);

        if (memImgFile != null && !memImgFile.isEmpty()) {
            // 절대 경로로 변경
            String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/images/profile/";
            String fileName = UUID.randomUUID() + "_" + memImgFile.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            dest.getParentFile().mkdirs();
            memImgFile.transferTo(dest);
            profile.setMemImg(fileName);
        }

        memberProfileRepository.save(profile);
    }

    // 닉네임 중복 체크
    public long countByNickname(String memNickname) {
        return memberProfileRepository.findAll().stream()
                .filter(p -> memNickname.equals(p.getMemNickname()))
                .count();
    }
}
