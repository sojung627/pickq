package org.example.bbs.memberProfile;

import lombok.*;

@Getter
@Builder
public class MemberProfileDTO {

    // 프로필 모달용
    private Long memIdx;
    private String memNickname;
    private String memName;
    private String maskedMemId;   // mem_id 마스킹 처리값 (서비스단 가공)
    private String memIntro;
    private String memImg;
    private String gradeName;     // grade 테이블 join 필요
    private Double avgRating;     // review 집계값
    private Long reviewCount;     // review 집계값
}
