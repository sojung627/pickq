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

    // Entity를 Dto로 변환 (조회 시 사용)
    public static AddressDTO fromEntity(MemberAddrEntity entity) {
        return AddressDTO.builder()
                .addrIdx(entity.getAddrIdx())
                // member 객체가 null이 아닐 때만 데이터 추출
                .memId(entity.getMember() != null ? entity.getMember().getMemId() : null)
                .memTel(entity.getMember() != null ? entity.getMember().getMemTel() : null)
                .memAddr(entity.getMemAddr())
                .isPrimary(entity.getIsPrimary())
                .build();
    }

    // Dto를 Entity로 변환 (저장/수정 시 사용)
    // 저장할 때는 member 객체 전체를 넣어줘야 하므로 상황에 따라 서비스에서 처리하는 게 좋아!
    public MemberAddrEntity toEntity(MemberEntity member) {
        return MemberAddrEntity.builder()
                .addrIdx(this.addrIdx)
                .member(member) // 파라미터로 받은 member 객체 설정
                .memAddr(this.memAddr)
                .isPrimary(this.isPrimary != null ? this.isPrimary : "N")
                .build();
    }
}
