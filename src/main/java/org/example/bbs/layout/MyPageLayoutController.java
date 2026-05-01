package org.example.bbs.layout;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/support")
public class MyPageLayoutController {

    @GetMapping("/MyPageLayout")
    public String myPageLayout() {
        return "/layout/MyPageLayout";
    }
}
