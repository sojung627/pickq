package org.example.bbs.member;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequestDTO {
    private String memId;
    private String memPwd;
}
