package org.example.bbs.board;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardTypeRepository boardTypeRepository;

    // 보드 리스트
    public Map<String, Object> getBoardList(int page, String searchType, String keyword, String typeCode) {
        Pageable pageable = PageRequest.of(page - 1, 10, Sort.by("boardIdx").descending());

        Page<BoardEntity> boardPage = boardRepository.findBySearch(typeCode, keyword, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("boards", boardPage.getContent().stream()
                .map(b -> {
                    String memId = null;
                    try {
                        memId = b.getMember().getMemId();
                    } catch (Exception e) {
                        memId = "(탈퇴회원)";
                    }
                    return BoardListDTO.builder()
                            .boardIdx(b.getBoardIdx())
                            .boardTitle(b.getBoardTitle())
                            .boardViewCount(b.getBoardViewCount())
                            .boardLike(b.getBoardLike())
                            .boardRegdate(b.getBoardRegdate())
                            .boardTypeCode(b.getBoardType().getBoardTypeCode())
                            .memId(memId)
                            .build();
                })
                .toList());
        result.put("currentPage", page);
        result.put("totalPages", boardPage.getTotalPages());

        int blockLimit = 5;
        int start = (((int) (Math.ceil((double) page / blockLimit))) - 1) * blockLimit + 1;
        int end = Math.min((start + blockLimit - 1), Math.max(1, boardPage.getTotalPages()));

        result.put("blockStart", start);
        result.put("blockEnd", end);

        if (typeCode != null && !typeCode.isEmpty()) {
            result.put("currentType", boardTypeRepository.findByBoardTypeCode(typeCode).orElse(null));
        }

        return result;
    }


    // 보드 상세보기
    @Transactional
    public BoardDetailDTO getBoardDetail(String boardTypeCode, Long boardIdx) {
        BoardEntity board = boardRepository.findDetail(boardTypeCode, boardIdx)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        // 조회수 증가
        board.setBoardViewCount(board.getBoardViewCount() + 1);

        return BoardDetailDTO.builder()
                .boardIdx(board.getBoardIdx())
                .boardTitle(board.getBoardTitle())
                .boardContent(board.getBoardContent())
                .boardTypeCode(board.getBoardType().getBoardTypeCode())
                .boardTypeName(board.getBoardType().getBoardTypeName())
                .memIdx(board.getMember().getMemIdx())
                .memId(board.getMember().getMemId())
                .boardViewCount(board.getBoardViewCount())
                .boardLike(board.getBoardLike())
                .boardRegdate(board.getBoardRegdate())
                .isLiked(true) 
                .build();
    }
}