import React, { useState, useEffect, useRef } from 'react';

const MemberProfileUpdate = () => {
    // 초기상태 세팅
    const fileInputRef = useRef(null); // 아직 input이 null

    // 상태관리
    // 코드해석: 앞으로 이 변수 쓸거니까 저장하라(useState)
    const [profile, setProfile] = useState({
        memNickname: '',
        memIntro: '',
        memImg: '',
    });
    const [originalData, setOriginalData] = useState({}); // 초기값 비교용
    const [previewUrl, setPreviewUrl] = useState({});     // 이미지 미리보기
    const [selectedFile, setSelectFile] = useState(null); // 실제 업로드용 파일
    const [messages, setMessages] = useState({ nickname: '', intro: ''}); // 메시지(제약조건 위반 시)
    const [isNicknameOk, setIsNicknameOk] = useState(true); // 닉네임 중복 체크
    const [isDirty, setIsDirty] = useState(false); // 이전 값과 다르다면 저장
    const [isValid, setIsValid] = useState(false); // 입력값 이상 유무 재검사

    // 초기 데이터 로드(백엔드 연결)
    useEffect (() => {
        fetch("http://localhost:8080/mypage/profile/data", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                // 초기상태
                const initial = {
                    memNickname: data.memNickname || '',
                    memIntro: data.memIntro || '',
                    memImg: data.memImg || 'profile_default.png'
                };
                setProfile(initial); // 실시간 데이터 체크
                setOriginalData(initial); // 초기데이터 구분(이전 데이터와 현재 데이터를 구분!)
                setPreviewUrl(`http://localhost:8080/images/profile/${initial.memImg}`); // 이미지 경로 저장
             });
    }, []); // useEffect

    // 닉네임 증복 체크
    const checkNickname = async

};

export default MemberProfileUpdate;