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
}