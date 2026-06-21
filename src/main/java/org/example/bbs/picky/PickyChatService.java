package org.example.bbs.picky;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.bbs.gemini.GeminiService;
import org.example.bbs.member.MemberEntity;
import org.example.bbs.member.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PickyChatService {

    private final GeminiService geminiService;
    private final PickyChatSessionRepository sessionRepository;
    private final PickyChatMessageRepository messageRepository;
    private final MemberRepository memberRepository;

    // 채팅 메인 로직
    @Transactional
    public PickyChatResponseDTO chat(PickyChatRequestDTO request, String memId) {

        boolean isLoggedIn = (memId != null);

        // 대화 히스토리 구성 (멀티턴)
        List<PickyChatMessageEntity> history = List.of();
        PickyChatSessionEntity session = null;

        if (isLoggedIn) {
            session = resolveSession(request, memId);
            history = messageRepository.findTop20BySessionSessionIdxOrderByCreatedAtAsc(session.getSessionIdx());
        }

        // Gemini 호출
        String answer = geminiService.chat(request.getMessage(), history);

        // 로그인 사용자면 DB 저장
        if (isLoggedIn && session != null) {
            messageRepository.save(PickyChatMessageEntity.of(session, "user", request.getMessage()));
            messageRepository.save(PickyChatMessageEntity.of(session, "assistant", answer));
            // updated_at은 @PreUpdate가 자동 처리
            session.setUpdatedAt(java.time.LocalDateTime.now());
            sessionRepository.save(session);
        }

        return PickyChatResponseDTO.builder()
                .answer(answer)
                .sessionIdx(isLoggedIn && session != null ? session.getSessionIdx() : null)
                .build();
    }

    // 세션 조회 / 생성
    private PickyChatSessionEntity resolveSession(PickyChatRequestDTO request, String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalStateException("회원 정보 없음: " + memId));

        // sessionIdx가 있으면 기존 세션 사용
        if (request.getSessionIdx() != null) {
            return sessionRepository
                    .findBySessionIdxAndMemberMemIdxAndIsDeleted(
                            request.getSessionIdx(), member.getMemIdx(), "N")
                    .orElseGet(() -> createNewSession(member, request.getMessage()));
        }

        // 없으면 새 세션 생성
        return createNewSession(member, request.getMessage());
    }

    private PickyChatSessionEntity createNewSession(MemberEntity member, String firstMessage) {
        PickyChatSessionEntity session = PickyChatSessionEntity.of(member, firstMessage);
        return sessionRepository.save(session);
    }

    // 세션 목록 조회 (로그인 사용자 전용)
    @Transactional(readOnly = true)
    public List<PickySessionDTO> getSessions(String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalStateException("회원 정보 없음: " + memId));

        return sessionRepository
                .findByMemberMemIdxAndIsDeletedOrderByUpdatedAtDesc(member.getMemIdx(), "N")
                .stream()
                .map(PickySessionDTO::from)
                .collect(Collectors.toList());
    }

    // 특정 세션의 메시지 조회 (로그인 사용자 전용)
    @Transactional(readOnly = true)
    public List<PickyMessageDTO> getMessages(Long sessionIdx, String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalStateException("회원 정보 없음: " + memId));

        // 본인 세션인지 검증
        sessionRepository
                .findBySessionIdxAndMemberMemIdxAndIsDeleted(sessionIdx, member.getMemIdx(), "N")
                .orElseThrow(() -> new IllegalStateException("세션 없음 또는 권한 없음"));

        return messageRepository.findBySessionSessionIdxOrderByCreatedAtAsc(sessionIdx)
                .stream()
                .map(PickyMessageDTO::from)
                .collect(Collectors.toList());
    }

    // 세션 삭제 (소프트 딜리트)
    @Transactional
    public void deleteSession(Long sessionIdx, String memId) {
        MemberEntity member = memberRepository.findByMemId(memId)
                .orElseThrow(() -> new IllegalStateException("회원 정보 없음: " + memId));

        PickyChatSessionEntity session = sessionRepository
                .findBySessionIdxAndMemberMemIdxAndIsDeleted(sessionIdx, member.getMemIdx(), "N")
                .orElseThrow(() -> new IllegalStateException("세션 없음 또는 권한 없음"));

        session.setIsDeleted("Y");
        sessionRepository.save(session);
    }
}
