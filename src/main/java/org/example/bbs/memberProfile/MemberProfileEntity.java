package org.example.bbs.memberProfile;

import jakarta.persistence.*;
import lombok.*;
import org.example.bbs.member.MemberEntity;

@Entity
@Table(name = "member_profile")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemberProfileEntity {

    @Id
    @Column(name = "mem_idx")
    private Long memIdx;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "mem_idx")
    private MemberEntity member;

    @Column(name = "mem_nickname", length = 50)
    private String memNickname;

    @Column(name = "mem_intro", length = 255)
    private String memIntro;

    @Column(name = "mem_img", length = 255)
    private String memImg;
}
