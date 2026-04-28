package org.example.bbs.main;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> data = new HashMap<>();

        data.put("hotAuctions", new ArrayList<>());      // 인기 요청 리스트
        data.put("deadlineAuctions", new ArrayList<>()); // 마감 임박 리스트
        data.put("latestAuctions", new ArrayList<>());   // 최근 등록 리스트

        return data;
    }
}
