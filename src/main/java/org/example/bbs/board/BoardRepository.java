package org.example.bbs.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<BoardEntity, Long> {

    // 게시글 리스트 띄우기
    @Query("SELECT b FROM BoardEntity b " +
            "JOIN FETCH b.member " +
            "JOIN FETCH b.boardType " +
            "WHERE (:typeCode IS NULL OR b.boardType.boardTypeCode = :typeCode) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "    (:searchType = 'all' AND (b.boardTitle LIKE %:keyword% OR b.boardContent LIKE %:keyword%)) OR " +
            "    (:searchType = 'title' AND b.boardTitle LIKE %:keyword%) OR " +
            "    (:searchType = 'content' AND b.boardContent LIKE %:keyword%) OR " +
            "    (:searchType = 'writer' AND b.member.memId LIKE %:keyword%))")
    Page<BoardEntity> findBySearch(
            @Param("typeCode") String typeCode,
            @Param("keyword") String keyword,
            @Param("searchType") String searchType,
            Pageable pageable);
    // 게시글 상세보기
    @Query("SELECT b FROM BoardEntity b JOIN FETCH b.member JOIN FETCH b.boardType " +
            "WHERE b.boardType.boardTypeCode = :boardTypeCode AND b.boardIdx = :boardIdx AND b.boardIsDeleted = 'N'")
    Optional<BoardEntity> findDetail(@Param("boardTypeCode") String boardTypeCode, @Param("boardIdx") Long boardIdx);

    // 마이페이지 게시글 리스트 조회 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    List<BoardEntity> findByMember_MemIdAndBoardIsDeletedOrderByBoardRegdateDesc(String memId, String boardIsDeleted);

    // 댓글 수
    @Query("SELECT b, COUNT(r) FROM BoardEntity b " +
            "JOIN FETCH b.boardType " +
            "LEFT JOIN ReplyEntity r ON r.board.boardIdx = b.boardIdx " +
            "AND r.replyIsDeleted = 'N' " +
            "WHERE b.member.memId = :memId AND b.boardIsDeleted = 'N' " +
            "GROUP BY b " +
            "ORDER BY b.boardRegdate DESC")
    List<Object[]> findByMemberWithReplyCount(@Param("memId") String memId);

}