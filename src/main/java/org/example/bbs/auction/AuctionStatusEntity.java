package org.example.bbs.auction;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "auction_status")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AuctionStatusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_status_idx")
    private Integer auctionStatusIdx;

    @Column(name = "auction_status_code", nullable = false, length = 50, unique = true)
    private String auctionStatusCode;

    @Column(name = "auction_status_name", nullable = false, length = 50)
    private String auctionStatusName;

    @PrePersist
    public void prePersist() {
        // 상태 코드나 이름이 누락되지 않도록 방어 로직 (필요시 기본값 설정)
        if (auctionStatusCode == null) auctionStatusCode = "OPEN";
        if (auctionStatusName == null) auctionStatusName = "진행중";
    }
}
