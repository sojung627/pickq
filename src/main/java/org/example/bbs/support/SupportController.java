package org.example.bbs.support;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/support")
public class SupportController {

    // 이용안내 페이지
    @GetMapping("/guide")
    public String usageGuide() {
        return "support/guide";
    }

    // 고객문의 페이지
    @GetMapping("/inquiry")
    public String inquiry() {
        return "support/inquiry";
    }

    // 자주 묻는 질문(FAQ) 페이지
    @GetMapping("/faq")
    public String faq() {
        return "support/faq";
    }
}
