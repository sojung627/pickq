# PickQ

## 📌 프로젝트 소개

구매자가 원하는 스포츠 용품과 희망 예산을 등록하면 판매자들이 상품과 가격을 제안하는 역경매 기반 중고 거래 웹 서비스입니다.

기존 중고 거래 서비스에서 구매자가 원하는 상품을 직접 검색하고 여러 판매자와 조건을 비교해야 하는 불편함을 줄이고자 기획했습니다.

경매 등록부터 입찰, 낙찰, 결제, 배송, 구매확정까지 이어지는 거래 과정을 하나의 서비스 안에서 이용할 수 있도록 구현했습니다. 또한 커뮤니티, 실시간 채팅 및 알림, 리뷰, AI 챗봇 기능을 제공하여 거래 편의성과 사용자 간 소통을 높이는 데 중점을 두었습니다.

## 🛠 기술 스택

### 💻 Language

Java 21, JavaScript, SQL

### ⚙️ Framework

Spring Boot 3.4.1

Spring MVC, Spring Data JPA

Spring Security, Gradle

### 🎨 Frontend

React 19, Vite

HTML5, CSS3, Tailwind CSS

React Router, Axios

Bootstrap Icons, Flatpickr

### 🖥 Backend

Spring Data JPA

Lombok

Session 기반 인증과 BCrypt 비밀번호 암호화

REST API

WebSocket, STOMP, SockJS 기반 실시간 통신

### 🗄 Database

MySQL

Entity / Repository / Service / Controller 계층 구조

JPA 연관관계 기반 데이터 관리

### 🚀 Deployment

Docker, Docker Compose

Nginx

### 🔗 External API

Toss Payments 결제 API

Naver 로그인 API

SOLAPI 문자 인증 API

Google Gemini API

## ✨ 주요 기능

회원가입 / 로그인 / 로그아웃 / 회원 탈퇴

아이디 중복 확인 / 비밀번호 찾기 / 문자 인증 / 네이버 로그인

프로필 / 배송지 / 회원정보 관리

스포츠 용품 역경매 등록 / 조회 / 검색 / 카테고리 분류

판매자 입찰 / 입찰 취소 / 구매자 낙찰 처리

결제 / 판매자의 배송정보 등록 / 구매자의 구매확정

구매자와 판매자 간 실시간 채팅

입찰, 낙찰, 댓글, 좋아요, 배송 상태 등에 대한 실시간 알림

게시판 / 댓글 / 답글 / 좋아요 기능

거래 리뷰 / 별점 / 회원 등급 및 활동 점수 관리

Gemini 기반 리뷰 핵심 키워드 추출

Gemini 기반 AI 이용 도우미 ‘피키’와 대화 내역 관리

## 💡 느낀 점

이번 프로젝트를 통해 단순한 상품 등록과 조회를 넘어 구매 요청, 입찰, 낙찰, 결제, 배송, 구매확정으로 이어지는 전체 거래 흐름을 설계하고 구현해볼 수 있었습니다.

특히 각 거래 단계의 상태와 사용자 권한을 정확히 확인해야 했으며, 하나의 상태 변경이 주문, 알림, 채팅, 리뷰, 회원 등급 등 여러 기능에 영향을 준다는 점에서 데이터 구조와 서비스 로직 설계의 중요성을 배웠습니다.

React와 Spring Boot를 분리하여 REST API로 연동하고 WebSocket을 이용한 실시간 채팅과 알림, 외부 결제·소셜 로그인·문자 인증·AI API를 연결하면서 프론트엔드와 백엔드가 함께 동작하는 전체 서비스 구조를 경험할 수 있었습니다.

기능을 확장하는 과정에서 중복 코드와 복잡해진 서비스 로직을 더 세분화할 필요성도 느꼈습니다. 앞으로 예외 처리와 테스트 코드를 보강하고, 보안 설정과 배포 환경을 정리하여 유지보수성과 안정성을 높이는 방향으로 리팩토링하고 싶습니다.
