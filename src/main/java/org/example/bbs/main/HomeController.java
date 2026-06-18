package org.example.bbs.main;

import lombok.RequiredArgsConstructor;
import org.example.bbs.auction.AuctionListDTO;
import org.example.bbs.auction.AuctionService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class HomeController {

    private final AuctionService auctionService;

    @GetMapping("/")
    public Map<String, Object> home() {
        List<AuctionListDTO> hotList      = auctionService.findAllAuctions(null, "views",    "open", null);
        List<AuctionListDTO> deadlineList = auctionService.findAllAuctions(null, "deadline", "open", null);
        List<AuctionListDTO> latestList   = auctionService.findAllAuctions(null, "latest",   "open", null);

        Map<String, Object> data = new HashMap<>();
        data.put("hotAuctions",      hotList.subList(0,      Math.min(4, hotList.size())));
        data.put("deadlineAuctions", deadlineList.subList(0, Math.min(4, deadlineList.size())));
        data.put("latestAuctions",   latestList.subList(0,   Math.min(5, latestList.size())));

        return data;
    }
}
