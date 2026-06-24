package org.example.bbs.memberProfile;

import lombok.RequiredArgsConstructor;
import org.example.bbs.grade.GradeRepository;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.review.ReviewDTO;
import org.example.bbs.review.ReviewRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

    private final MemberProfileRepository memberProfileRepository;
    private final MemberRepository memberRepository;
    private final ReviewRepository reviewRepository;
    private final GradeRepository gradeRepository;

    @Value("${app.upload.root-dir:./uploads}")
    private String uploadRootDir;

    // 프로필 조회
    public MemberProfileEntity getProfile(String memId) {
        return memberProfileRepository.findByMember_MemId(memId)
                .orElse(null);
    }

    // 프로필 저장/수정
    // 파일 저장 실패 시 닉네임/소개만 DB에 반영되는 일을 막기 위해 checked exception도 롤백한다.
    @Transactional(rollbackFor = Exception.class)
    public void saveProfile(
            String memId,
            String memNickname,
            String memIntro,
            MultipartFile memImgFile
    ) throws IOException {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        MemberProfileEntity profile = memberProfileRepository.findByMember_MemId(memId)
                .orElseGet(() -> memberProfileRepository.save(
                        MemberProfileEntity.builder()
                                .member(member)
                                .build()
                ));

        String savedFileName = null;

        if (memImgFile != null && !memImgFile.isEmpty()) {
            validateImageFile(memImgFile);

            Path profileDirectory = Paths.get(uploadRootDir, "profile")
                    .toAbsolutePath()
                    .normalize();
            Files.createDirectories(profileDirectory);

            String originalName = StringUtils.cleanPath(
                    memImgFile.getOriginalFilename() == null
                            ? "profile-image"
                            : memImgFile.getOriginalFilename()
            );

            if (originalName.contains("..")) {
                throw new IllegalArgumentException("잘못된 파일명입니다.");
            }

            String extension = getExtension(originalName);
            savedFileName = UUID.randomUUID() + extension;

            Path targetPath = profileDirectory
                    .resolve(savedFileName)
                    .normalize();

            if (!targetPath.startsWith(profileDirectory)) {
                throw new IllegalArgumentException("잘못된 저장 경로입니다.");
            }

            Files.copy(
                    memImgFile.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        // 파일 저장 성공 후 DB 값을 갱신한다.
        profile.setMemNickname(memNickname);
        profile.setMemIntro(memIntro);

        if (savedFileName != null) {
            profile.setMemImg(savedFileName);
        }

        memberProfileRepository.save(profile);
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex).toLowerCase();
    }

    // 닉네임 중복 체크
    public long countByNickname(String memNickname) {
        return memberProfileRepository.findAll().stream()
                .filter(p -> memNickname.equals(p.getMemNickname()))
                .count();
    }

    // maskedMemId 마스킹 처리
    private String maskMemId(String memId) {
        if (memId == null || memId.length() < 4) return "****";
        return memId.substring(0, memId.length() - 3) + "***";
    }

    // 프로필 모달용 DTO 반환
    public MemberProfileDTO getProfileModal(Long memIdx) {
        MemberEntity member = memberRepository.findById(memIdx)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        MemberProfileEntity profile = memberProfileRepository.findById(memIdx)
                .orElse(null);

        Double avgRating = reviewRepository.findAvgRating(memIdx);
        Long reviewCount = reviewRepository.findReviewCountByBidderIdx(memIdx);

        String gradeName = gradeRepository.findById(member.getMemGradeIdx())
                .map(g -> g.getGradeName())
                .orElse(null);

        return MemberProfileDTO.builder()
                .memIdx(member.getMemIdx())
                .memName(member.getMemName())
                .memNickname(profile != null ? profile.getMemNickname() : null)
                .maskedMemId(maskMemId(member.getMemId()))
                .memIntro(profile != null ? profile.getMemIntro() : null)
                .memImg(profile != null ? profile.getMemImg() : null)
                .avgRating(avgRating != null ? avgRating : 0.0)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                .gradeName(gradeName)
                .build();
    }

    public List<ReviewDTO> getReviewsForModal(Long memIdx) {
        List<Map<String, Object>> rows = reviewRepository.findReceivedReviews(memIdx);

        return rows.stream().map(row -> {
            LocalDateTime regdate = null;
            Object rawDate = row.get("reviewRegdate");
            if (rawDate instanceof java.sql.Timestamp ts) {
                regdate = ts.toLocalDateTime();
            }

            return ReviewDTO.builder()
                    .reviewIdx(((Number) row.get("reviewIdx")).longValue())
                    .reviewStar(((Number) row.get("reviewStar")).doubleValue())
                    .reviewTitle((String) row.get("reviewTitle"))
                    .reviewRegdate(regdate)
                    .auctionTitle((String) row.get("auctionTitle"))
                    .reviewKeywords((String) row.get("reviewKeywords"))
                    .build();

        }).collect(Collectors.toList());
    }
}
