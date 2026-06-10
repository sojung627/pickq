package org.example.bbs.memberProfile;

import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.example.bbs.review.ReviewDTO;
import org.example.bbs.review.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
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
            String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";
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

    // 프로필 모달 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // maskedMemId 마스킹 처리 예시
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

        return MemberProfileDTO.builder()
                .memIdx(member.getMemIdx())
                .memName(member.getMemName())
                .memNickname(profile != null ? profile.getMemNickname() : null)
                .maskedMemId(maskMemId(member.getMemId()))
                .memIntro(profile != null ? profile.getMemIntro() : null)
                .memImg(profile != null ? profile.getMemImg() : null)
                .avgRating(avgRating != null ? avgRating : 0.0)
                .reviewCount(reviewCount != null ? reviewCount : 0L)
                // gradeName은 grade 테이블 필요 (현재 보류)
                .build();
    }

    // 프로필 모달용 리뷰 목록 반환
//    public List<ReviewDTO> getReviewsForModal(Long memIdx) {
//        List<Map<String, Object>> rows = reviewRepository.findReceivedReviews(memIdx);
//
//        return rows.stream().map(row -> ReviewDTO.builder()
//                .reviewIdx(((Number) row.get("reviewIdx")).longValue())
//                .reviewStar(((Number) row.get("reviewStar")).doubleValue())
//                .reviewTitle((String) row.get("reviewTitle")) // ReviewDTO에 필드 추가 필요
//                .reviewRegdate(/* reviewRegdate 변환 */)
//                .auctionTitle((String) row.get("auctionTitle"))
//                .build()
//        ).collect(Collectors.toList());
//    }

    public List<ReviewDTO> getReviewsForModal(Long memIdx) {
        List<Map<String, Object>> rows = reviewRepository.findReceivedReviews(memIdx);

        return rows.stream().map(row -> {

            // Timestamp → LocalDateTime 변환
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
                    .build();

        }).collect(Collectors.toList());
    }


}
