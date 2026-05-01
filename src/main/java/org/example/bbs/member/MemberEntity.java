package org.example.bbs.member;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mem_idx")
    private Long memIdx;

    @Column(name = "mem_id", nullable = false, length = 50, unique = true)
    private String memId;

    @Column(name = "mem_pwd", nullable = false, length = 255)
    private String memPwd;

    @Column(name = "mem_name", length = 50)
    private String memName;

    @Column(name = "mem_tel", length = 20)
    private String memTel;

    @Column(name = "mem_email", length = 100)
    private String memEmail;

    @Column(name = "mem_ip", nullable = false, length = 100)
    private String memIp;

    @Column(name = "mem_role_idx", nullable = false)
    private Integer memRoleIdx;

    @Column(name = "mem_grade_idx", nullable = false)
    private Integer memGradeIdx;

    @Column(name = "mem_credit", nullable = false)
    private Integer memCredit = 50;

    @Column(name = "mem_penalty", nullable = false)
    private Integer memPenalty = 0;

    @Column(name = "mem_bday")
    private LocalDate memBday;

    @Column(name = "mem_regdate", updatable = false)
    private LocalDateTime memRegdate;

    @Column(name = "mem_is_deleted", nullable = false, length = 1)
    private String memIsDeleted = "N";

    @Column(name = "mem_deldate")
    private LocalDateTime memDeldate;

    @Column(name = "mem_login_type", length = 10)
    private String memLoginType;

    @PrePersist
    public void prePersist() {
        if (memRegdate == null) memRegdate = LocalDateTime.now();
        if (memCredit == null) memCredit = 50;
        if (memPenalty == null) memPenalty = 0;
        if (memIsDeleted == null) memIsDeleted = "N";
        if (memLoginType == null) memLoginType = "LOCAL";
    }
}
