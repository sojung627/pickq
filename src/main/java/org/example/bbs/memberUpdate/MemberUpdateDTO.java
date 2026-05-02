package org.example.bbs.memberUpdate;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberUpdateDTO {
    private String memId;
    private String memName;
    private String memEmail;
    private String memTel;
    private LocalDate memBday;
    private String newPwd;
    private String newPwdConfirm;
}