package org.example.bbs.board;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/boards")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // 리액트 포트 허용
public class BoardController {

    private final BoardService boardService;
    private final BoardRepository boardRepository;
    private final BoardTypeRepository boardTypeRepository;

    // 게시판 종류 불러오기
    @GetMapping("/types")
    public List<BoardTypeEntity> getBoardTypes() {
        return boardTypeRepository.findAll();
    }

    // 게시글 목록 가져오기(useEffect용)
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "all") String searchType,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String typeCode) {

        Map<String, Object> response = boardService.getBoardList(page, searchType, keyword, typeCode);
        return ResponseEntity.ok(response);
    }
}