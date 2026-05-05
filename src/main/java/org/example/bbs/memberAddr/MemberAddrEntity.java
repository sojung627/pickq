package org.example.bbs.memberAddr;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;

@Entity
@Table(name = "member_addr")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemberAddrEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "addr_idx")
    private Long addrIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_idx", nullable = false)
    private MemberEntity member;

    @Column(name = "mem_zipcode", length = 10)
    private String memZipcode;

    @Column(name = "mem_addr", length = 255)
    private String memAddr;

    @Column(name = "mem_addr_detail", length = 255)
    private String memAddrDetail;

    @Column(name = "is_primary", nullable = false, length = 1)
    private String isPrimary = "N";

    @PrePersist
    public void prePersist() {
        if (isPrimary == null) {
            isPrimary = "N";
        }
    }

    // 조인
    // MemberEntity와 조인 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memId") // DB의 외래키 컬럼명
    private MemberEntity member;
}
