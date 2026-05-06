package org.example.bbs.memberAddr;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mypage/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MemberAddrController {

    private final MemberAddrService memberAddrService;

    // 배송지 리스트 조회
    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAddressList(
            @SessionAttribute(name = "loginMember") String memId) {
        List<AddressDTO> list = memberAddrService.findAllByMemId(memId);
        return ResponseEntity.ok(list);
    }

    // 배송지 단건 조회
    @GetMapping("/{addrIdx}")
    public ResponseEntity<AddressDTO> getAddress(@PathVariable Long addrIdx) {
        AddressDTO dto = memberAddrService.findByAddrIdx(addrIdx);
        return ResponseEntity.ok(dto);
    }

    // 새 배송지 추가
    @PostMapping("/new")
    public ResponseEntity<String> addAddress(@RequestBody AddressDTO addressDTO) {
        memberAddrService.saveAddress(addressDTO);
        return ResponseEntity.ok("success");
    }

    // 배송지 수정
    @PutMapping("/edit")
    public ResponseEntity<String> updateAddress(@RequestBody AddressDTO addressDTO) {
        memberAddrService.updateAddress(addressDTO);
        return ResponseEntity.ok("updated");
    }

    // 배송지 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteAddress(@RequestParam Long addrIdx) {
        memberAddrService.deleteAddress(addrIdx);
        return ResponseEntity.ok("deleted");
    }

    // 대표 배송지 설정
    @PutMapping("/primary")
    public ResponseEntity<String> setPrimaryAddress(
            @RequestParam Long addrIdx,
            @SessionAttribute(name = "loginMember") String memId) {
        memberAddrService.updatePrimaryAddress(addrIdx, memId);
        return ResponseEntity.ok("primary updated");
    }
}