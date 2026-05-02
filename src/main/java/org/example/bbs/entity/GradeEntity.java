package org.example.bbs.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grade")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class GradeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grade_idx")
    private Integer gradeIdx;

    @Column(name = "grade_name", nullable = false, length = 20)
    private String gradeName; // basic, silver, gold, vip

    @Column(name = "grade_credit", nullable = false)
    private Double gradeCredit; // 신용도 기준 (평균 별점 등)

}