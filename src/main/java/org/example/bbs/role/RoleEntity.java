package org.example.bbs.role;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_idx")
    private Integer role_idx; // INT 타입이니까 Integer로!

    @Column(name = "role_name", nullable = false, length = 20)
    private String roleName; // USER, ADMIN 등 권한 명칭

}
