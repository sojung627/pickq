package org.example.bbs.board;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MyPostsController {

    private final BoardService boardService;

    // 마이페이지 게시글 리스트 조회
    @GetMapping("/mypage/boards")
    public ResponseEntity<List<BoardListDTO>> getMyBoards(
            @SessionAttribute(name = "loginMember") String memId) {
        List<BoardListDTO> boards = boardService.getMyBoards(memId);
        return ResponseEntity.ok(boards);
    }
}
