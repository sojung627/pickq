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

    public Map<String, Object> getBoardList(int page, String searchType, String keyword, String typeCode) {
        // 스프링 페이지는 0부터 시작하니까 -1 해줘야 해
        Pageable pageable = PageRequest.of(page - 1, 10, Sort.by("boardIdx").descending());

        // 검색 로직 (실제로는 searchType에 따라 분기 처리 필요)
        Page<BoardEntity> boardPage = boardRepository.findBySearch(typeCode, keyword, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("boards", boardPage.getContent());
        result.put("currentPage", page);
        result.put("totalPages", boardPage.getTotalPages());

        // 페이징 블록 계산 (5개씩 보여준다고 가정)
        int blockLimit = 5;
        int start = (((int) (Math.ceil((double) page / blockLimit))) - 1) * blockLimit + 1;
        int end = Math.min((start + blockLimit - 1), boardPage.getTotalPages());

        result.put("blockStart", start);
        result.put("blockEnd", end);

        // 현재 게시판 타입 정보
        if (typeCode != null) {
            result.put("currentType", boardRepository.findById(typeCode).orElse(null)); // TypeCode는 Long이 필요 근데 너가 준건 String
        }

        return result;
    }
}
