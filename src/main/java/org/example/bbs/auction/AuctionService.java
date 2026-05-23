package org.example.bbs.auction;

import lombok.RequiredArgsConstructor;
import org.example.bbs.item.ItemCategoryEntity;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.io.File;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionService {

    // 마이페이지 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    private final AuctionRepository auctionRepository;
    private final ItemCategoryRepository  itemCategoryRepository;
    private final AuctionStatusRepository auctionStatusRepository;
    private final MemberRepository memberRepository;

    public List<AuctionDTO> findAuctionsByMemId(String memId) {
        List<AuctionEntity> entities = auctionRepository.findAllByBuyerMemId(memId);

        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AuctionDTO convertToDTO(AuctionEntity entity) {
        return AuctionDTO.builder()
                .auctionIdx(entity.getAuctionIdx())
                .auctionTitle(entity.getAuctionTitle())
                .itemCategoryName(entity.getItemCategory().getItemCategoryName())
                .auctionTargetPrice(entity.getAuctionTargetPrice())
                .auctionStatusIdx(entity.getAuctionStatus().getAuctionStatusIdx())
                .auctionStatusName(entity.getAuctionStatus().getAuctionStatusName())
                .auctionEndAt(entity.getAuctionEndAt())
                .auctionRegdate(entity.getAuctionRegdate())
                .bidCount(0L)
                .minBidPrice(null)
                .build();
    }

    // 경매 파트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 경매 리스트 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
    
    public List<AuctionListDTO> findAllAuctions(String category, String sortBy, String status, String keyword) {
        List<AuctionEntity> entities = auctionRepository.findAuctionsByFilters(category, status, keyword);

        // Java에서 정렬
        if ("views".equals(sortBy)) {
            entities.sort((a, b) -> Long.compare(
                    b.getAuctionViewCount() != null ? b.getAuctionViewCount() : 0,
                    a.getAuctionViewCount() != null ? a.getAuctionViewCount() : 0
            ));
        } else if ("deadline".equals(sortBy)) {
            entities.sort((a, b) -> {
                if (a.getAuctionEndAt() == null) return 1;
                if (b.getAuctionEndAt() == null) return -1;
                return a.getAuctionEndAt().compareTo(b.getAuctionEndAt());
            });
        } else {
            entities.sort((a, b) -> b.getAuctionRegdate().compareTo(a.getAuctionRegdate()));
        }
        return entities.stream().map(entity -> AuctionListDTO.builder()
                .auctionIdx(entity.getAuctionIdx())
                .auctionTitle(entity.getAuctionTitle())
                .itemCategoryName(entity.getItemCategory().getItemCategoryName())
                .auctionThumbnailImg(entity.getAuctionThumbnailImg())
                .auctionStatusIdx(entity.getAuctionStatus().getAuctionStatusIdx().intValue())
                .auctionTargetPrice(entity.getAuctionTargetPrice())
                .auctionViewCount(entity.getAuctionViewCount())
                .bidCount(0)
                .auctionEndAt(entity.getAuctionEndAt())
                .timeDisplay(calculateTime(entity.getAuctionEndAt()))
                .build()
        ).toList();
    }

    // 남은 시간 계산 로직 예시
    private String calculateTime(LocalDateTime endAt) {

        if (endAt == null) return "(날짜 없음)";

        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(endAt)) return "마감";

        long miniutes = ChronoUnit.MINUTES.between(now, endAt);
        long hours = ChronoUnit.HOURS.between(now, endAt);
        long days = ChronoUnit.DAYS.between(now, endAt);

        if (miniutes < 60) return miniutes + "분 남음";
        if (hours < 24) return hours + "시간 남음";
        return days + "일 남음";
    }

    // 경매 작성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    @Transactional
    public void registerAuction(
            AuctionWriteRequestDTO dto,
            MultipartFile thumbnailFile,
            String memId
    ) throws IOException {

        // 회원 조회
        MemberEntity buyer = memberRepository.findByMemId(memId)
                .orElseThrow(() ->
                        new IllegalArgumentException("회원을 찾을 수 없습니다."));

        // 카테고리 조회
        ItemCategoryEntity itemCategory =
                itemCategoryRepository.findById(dto.getItemCategoryIdx())
                        .orElseThrow(() ->
                                new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        // 경매 상태 조회 (OPEN = idx 1)
        AuctionStatusEntity auctionStatus =
                auctionStatusRepository.findById(1)
                        .orElseThrow(() ->
                                new IllegalArgumentException("경매 상태를 찾을 수 없습니다."));

        // 썸네일 저장 (선택)
        String thumbnailPath = null;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            thumbnailPath = saveFile(thumbnailFile);
        }

        // 날짜 파싱 (flatpickr 포맷: "yyyy-MM-dd HH:mm")
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime endAt    = LocalDateTime.parse(dto.getAuctionEndAt(), fmt);
        LocalDateTime decision = LocalDateTime.parse(dto.getAuctionDecisionDeadline(), fmt);

        // 엔티티 빌드 및 저장
        AuctionEntity auction = AuctionEntity.builder()
                .buyer(buyer)
                .itemCategory(itemCategory)
                .auctionStatus(auctionStatus)
                .auctionThumbnailImg(thumbnailPath)
                .auctionTitle(dto.getAuctionTitle())
                .auctionDesc(dto.getAuctionDesc())
                .auctionTargetPrice(dto.getAuctionTargetPrice())
                .auctionEndAt(endAt)
                .auctionDecisionDeadline(decision)
                .build();

        auctionRepository.save(auction);
    }

    // 파일 저장 유틸 메서드
    private String saveFile(MultipartFile file) throws IOException {
        String uploadDir = System.getProperty("user.dir") + "/uploads/auction/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String original  = file.getOriginalFilename();
        String ext       = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf("."))
                : ".jpg";
        String savedName = UUID.randomUUID().toString() + ext;

        file.transferTo(new File(uploadDir + savedName));
        return "/uploads/auction/" + savedName;
    }

    // 경매 상세보기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    public Map<String, Object> getAuctionDetail(Long auctionIdx, String memId) {
        AuctionEntity auction = auctionRepository.findById(auctionIdx)
                .orElseThrow(() -> new RuntimeException("경매를 찾을 수 없습니다."));

        Map<String, Object> detail = new HashMap<>();
        detail.put("auctionIdx", auction.getAuctionIdx());
        detail.put("auctionTitle", auction.getAuctionTitle());
        detail.put("auctionDesc", auction.getAuctionDesc());
        detail.put("auctionThumbnailImg", auction.getAuctionThumbnailImg());
        detail.put("auctionTargetPrice", auction.getAuctionTargetPrice());
        detail.put("auctionStatusIdx", auction.getAuctionStatus().getAuctionStatusIdx());
        detail.put("auctionEndAt", auction.getAuctionEndAt());
        detail.put("auctionDecisionDeadline", auction.getAuctionDecisionDeadline());
        detail.put("itemCategoryCode", auction.getItemCategory().getItemCategoryCode());
        detail.put("itemCategoryName", auction.getItemCategory().getItemCategoryName());
        detail.put("itemCategoryIdx", auction.getItemCategory().getItemCategoryIdx());
        detail.put("buyerIdx", auction.getBuyer().getMemIdx());
        detail.put("buyerMemIdMasked", maskMemId(auction.getBuyer().getMemId()));
        detail.put("bidCount", 0L);
        detail.put("minBidPrice", 0L);
        detail.put("timeDisplay", "");

        Map<String, Object> result = new HashMap<>();
        result.put("detail", detail);
        result.put("bidList", List.of());
        return result;
    }

    private String maskMemId(String memId) {
        if (memId == null || memId.length() <= 2) return memId;
        return memId.charAt(0) + "*".repeat(memId.length() - 2) + memId.charAt(memId.length() - 1);
    }

}