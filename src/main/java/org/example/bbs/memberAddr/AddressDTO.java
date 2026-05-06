package org.example.bbs.memberAddr;

import lombok.*;
import org.example.bbs.member.MemberEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDTO {

    private Long addrIdx;       // 주소 idx
    private String memId;       // 아이디
    private String memZipcode;  // 우편주소
    private String memAddr;     // 주소
    private String memAddrDetail; // 상세주소
    private String memTel;      // 연락처 (화면 표시용)
    private String isPrimary;   // 대표 배송지 여부(Y / N)

    // dto -> entity (조인용)
    public static AddressDTO fromEntity(MemberAddrEntity entity) {
        return AddressDTO.builder()
                .addrIdx(entity.getAddrIdx())
                // null 아니면 추출
                .memId(entity.getMember() != null ? entity.getMember().getMemId() : null)
                .memTel(entity.getMember() != null ? entity.getMember().getMemTel() : null)
                .memZipcode(entity.getMemZipcode())
                .memAddr(entity.getMemAddr())
                .memAddrDetail(entity.getMemAddrDetail())
                .isPrimary(entity.getIsPrimary())
                .build();
    }

    // dto -> entity (등록 / 수정)
    public MemberAddrEntity toEntity(MemberEntity member) {
        return MemberAddrEntity.builder()
                .addrIdx(this.addrIdx)
                .member(member)
                .memZipcode(this.memZipcode)
                .memAddr(this.memAddr)
                .memAddrDetail(this.memAddrDetail)
                .isPrimary(this.isPrimary != null ? this.isPrimary : "N")
                .build();
    }
}
