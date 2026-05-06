package org.example.bbs.memberAddr;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository; // 추가 필요
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberAddrService {

    private final MemberAddrRepository memberAddrRepository;
    private final MemberRepository memberRepository; // Member를 찾기 위해 주입

    public List<AddressDTO> findAllByMemId(String memId) {
        // 엔티티로 조회 후 DTO로 변환
        return memberAddrRepository.findByMember_MemId(memId).stream()
                .map(AddressDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public void saveAddress(AddressDTO dto) {
        // dto.toEntity()에 필요한 MemberEntity를 찾아서 전달
        MemberEntity member = memberRepository.findByMemId(dto.getMemId())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));
        memberAddrRepository.save(dto.toEntity(member));
    }

    public void deleteAddress(Long addrIdx) {
        memberAddrRepository.deleteById(addrIdx);
    }

    @Transactional
    public void updatePrimaryAddress(Long addrIdx, String memId) {
        memberAddrRepository.resetPrimaryStatus(memId);
        memberAddrRepository.setPrimaryStatus(addrIdx);
    }

    public AddressDTO findByAddrIdx(Long addrIdx) {
        MemberAddrEntity entity = memberAddrRepository.findById(addrIdx)
                .orElseThrow(() -> new RuntimeException("주소를 찾을 수 없습니다."));
        return AddressDTO.fromEntity(entity);
    }

    @Transactional
    public void updateAddress(AddressDTO dto) {
        MemberAddrEntity entity = memberAddrRepository.findById(dto.getAddrIdx())
                .orElseThrow(() -> new RuntimeException("주소를 찾을 수 없습니다."));
        entity.setMemZipcode(dto.getMemZipcode());
        entity.setMemAddr(dto.getMemAddr());
        entity.setMemAddrDetail(dto.getMemAddrDetail());
        entity.setIsPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : "N");
    }
}