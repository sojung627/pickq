package org.example.bbs.memberProfile;

import lombok.RequiredArgsConstructor;
import org.example.bbs.review.ReviewDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mypage/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MemberProfileController {

    private final MemberProfileService memberProfileService;

    // 프로필 데이터 조회
    @GetMapping("/data")
    public ResponseEntity<?> getProfileData(
            @SessionAttribute(name = "loginMember") String memId) {
        MemberProfileEntity profile = memberProfileService.getProfile(memId);

        if (profile == null) {
            return ResponseEntity.ok(Map.of(
                    "memNickname", "",
                    "memIntro", "",
                    "memImg", ""
            ));
        }

        return ResponseEntity.ok(Map.of(
                "memNickname", profile.getMemNickname() != null ? profile.getMemNickname() : "",
                "memIntro", profile.getMemIntro() != null ? profile.getMemIntro() : "",
                "memImg", profile.getMemImg() != null ? profile.getMemImg() : ""
        ));
    }

    // 프로필 저장 / 수정
    @PostMapping
    public ResponseEntity<String> saveProfile(
            @SessionAttribute(name = "loginMember") String memId,
            @RequestParam("memNickname") String memNickname,
            @RequestParam("memIntro") String memIntro,
            @RequestParam(value = "memImgFile", required = false) MultipartFile memImgFile) {
        try {
            memberProfileService.saveProfile(memId, memNickname, memIntro, memImgFile);
            return ResponseEntity.ok("success");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("fail");
        }
    }

    // 닉네임 중복 체크
    @PostMapping("/members/checkNickname")
    public ResponseEntity<Long> checkNickname(@RequestParam("memNickname") String memNickname) {
        long count = memberProfileService.countByNickname(memNickname);
        return ResponseEntity.ok(count);
    }

    // 프로필 모달 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 프로필 모달용 데이터 조회 (다른 회원 프로필 보기)
    @GetMapping("/modal/{memIdx}")
    public ResponseEntity<?> getProfileModal(@PathVariable Long memIdx) {
        MemberProfileDTO profile = memberProfileService.getProfileModal(memIdx);
        List<ReviewDTO> reviews = memberProfileService.getReviewsForModal(memIdx);

        Map<String, Object> result = new HashMap<>();
        result.put("profile", profile);
        result.put("reviews", reviews);

        return ResponseEntity.ok(result);
    }


}