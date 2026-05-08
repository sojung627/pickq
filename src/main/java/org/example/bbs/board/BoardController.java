package org.example.bbs.board;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
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

    // 게시글 목록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

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

    // 게시글 상세보기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 게시글 상세보기
    @GetMapping("/{boardTypeCode}/{boardIdx}")
    public ResponseEntity<BoardDetailDTO> detail(
            @PathVariable String boardTypeCode,
            @PathVariable Long boardIdx) {

        BoardDetailDTO board = boardService.getBoardDetail(boardTypeCode, boardIdx);
        return ResponseEntity.ok(board);
    }

    // 좋아요 토글
    @PostMapping("/{boardTypeCode}/{boardIdx}/like")
    public ResponseEntity<?> like(
            @PathVariable String boardTypeCode,
            @PathVariable Long boardIdx,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        Map<String, Object> result = boardService.toggleLike(boardIdx, memId);
        return ResponseEntity.ok(result);
    }

    // 댓글 / 답글
    @PostMapping("/{boardTypeCode}/{boardIdx}/replies")
    public ResponseEntity<?> writeReply(
            @PathVariable String boardTypeCode,
            @PathVariable Long boardIdx,
            @RequestBody ReplyWriteDTO dto,
            HttpServletRequest request,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        boardService.writeReply(boardIdx, dto, request, memId);
        return ResponseEntity.ok(Map.of("result", "success"));
    }

    // 댓글 목록
    @GetMapping("/{boardTypeCode}/{boardIdx}/replies")
    public ResponseEntity<?> getReplies(
            @PathVariable String boardTypeCode,
            @PathVariable Long boardIdx,
            @RequestParam(defaultValue = "oldest") String sort,
            @RequestParam(defaultValue = "1") int page) {

        Map<String, Object> result = boardService.getReplies(boardIdx, sort, page);
        return ResponseEntity.ok(result);
    }

    // 게시글 작성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

    // 게시글 작성하기
    @PostMapping("/{typeCode}")
    public ResponseEntity<?> write(
            @PathVariable String typeCode,
            @RequestBody BoardWriteDTO dto,
            HttpServletRequest request,
            HttpSession session) {

        String memId = (String) session.getAttribute("loginMember");
        if (memId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        Long boardIdx = boardService.writeBoard(typeCode, dto, request, memId);
        return ResponseEntity.ok(Map.of("boardIdx", boardIdx, "typeCode", typeCode));
    }
}