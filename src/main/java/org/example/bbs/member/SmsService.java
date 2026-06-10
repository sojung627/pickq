package org.example.bbs.member;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private final DefaultMessageService messageService;
    private final String senderNumber;

    public SmsService(
            @Value("${solapi.api-key}") String apiKey,
            @Value("${solapi.api-secret}") String apiSecret,
            @Value("${solapi.sender-number}") String senderNumber) {
        this.messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);
        this.senderNumber = senderNumber;
    }

    // SMS 인증번호 발송
    public void sendAuthCode(String toTel, String authCode) {
        String cleanTel = toTel.replace("-", "");

        Message message = new Message();
        message.setFrom(senderNumber);
        message.setTo(cleanTel);
        message.setText("PickQ의 본인 확인을 위한 인증번호는 [" + authCode + "]입니다.");

        try {
            messageService.send(message, null);
        } catch (Exception e) {
            throw new RuntimeException("SMS 발송에 실패했습니다.", e);
        }
    }
}