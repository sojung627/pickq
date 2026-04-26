package org.example.bbs.main;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> data = new HashMap<>();
//        data.put("hotAuctions", hotList);
//        data.put("deadlineAuctions", deadlineList);
//        data.put("latestAuctions", latestList);
        return data;
    }
}
