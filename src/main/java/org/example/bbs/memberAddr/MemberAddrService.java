package org.example.bbs.memberAddr;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberAddrService {

    private final MemberAddressRepository memberAddressRepository;

    public List<AddressDTO> findAllByMemId(String memId) {
        // DB에서 해당 회원의 주소 목록을 가져와서 DTO로 변환하는 로직
        return memberAddressRepository.findByMemId(memId);
    }

    public void saveAddress(AddressDTO dto) {
        memberAddressRepository.save(dto.toEntity());
    }

    public void deleteAddress(Long addrIdx) {
        memberAddressRepository.deleteById(addrIdx);
    }

    @Transactional
    public void updatePrimaryAddress(Long addrIdx, String memId) {
        // 1. 기존에 'Y'였던 배송지들을 모두 'N'으로 변경
        memberAddressRepository.resetPrimaryStatus(memId);
        // 2. 선택한 배송지만 'Y'로 변경
        memberAddressRepository.setPrimaryStatus(addrIdx);
    }

}
