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
        result.put("boards", boardPage.getContent());
        result.put("currentPage", page);
        result.put("totalPages", boardPage.getTotalPages());

        int blockLimit = 5;
        int start = (((int) (Math.ceil((double) page / blockLimit))) - 1) * blockLimit + 1;

        // totalPages가 0일 때 end가 0이 되지 않게 방어 로직 추가
        int end = Math.min((start + blockLimit - 1), Math.max(1, boardPage.getTotalPages()));

        result.put("blockStart", start);
        result.put("blockEnd", end);

        if (typeCode != null && !typeCode.isEmpty()) {
            // findById(Long) 대신 우리가 만든 findByBoardTypeCode(String) 사용!
            result.put("currentType", boardTypeRepository.findByBoardTypeCode(typeCode).orElse(null));
        }

        return result;
    }
}