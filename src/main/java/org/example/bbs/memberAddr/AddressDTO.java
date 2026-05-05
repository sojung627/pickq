package org.example.bbs.memberAddr;

import lombok.*;
import org.example.bbs.member.MemberEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDTO {

    private Long addrIdx;       // 배송지 고유 번호
    private String memId;       // 회원 아이디 (조회용)
    private String memAddr;     // 배송지 주소
    private String memTel;      // 회원 연락처 (화면 표시용)
    private String isPrimary;   // 대표 배송지 여부 ('Y' 또는 'N')

    // dto -> entity (조인용)
    public static AddressDTO fromEntity(MemberAddrEntity entity) {
        return AddressDTO.builder()
                .addrIdx(entity.getAddrIdx())
                // null 아니면 추출
                .memId(entity.getMember() != null ? entity.getMember().getMemId() : null)
                .memTel(entity.getMember() != null ? entity.getMember().getMemTel() : null)
                .memAddr(entity.getMemAddr())
                .isPrimary(entity.getIsPrimary())
                .build();
    }

    // dto -> entity (등록 / 수정)
    public MemberAddrEntity toEntity(MemberEntity member) {
        return MemberAddrEntity.builder()
                .addrIdx(this.addrIdx)
                .member(member)
                .memAddr(this.memAddr)
                .isPrimary(this.isPrimary != null ? this.isPrimary : "N")
                .build();
    }
}
