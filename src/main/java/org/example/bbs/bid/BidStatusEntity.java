package org.example.bbs.bid;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bid_status")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BidStatusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_status_idx")
    private Integer bidStatusIdx;

    @Column(name = "bid_status_code", nullable = false, length = 50, unique = true)
    private String bidStatusCode; // normal, won, lost, canceled

    @Column(name = "bid_status_name", nullable = false, length = 50)
    private String bidStatusName; // 일반, 낙찰 등

}