# Introduction
Node.js 활용한 게시판 개발
* Component Language : Node,JavaScript,MongoDB
* design : Adobe XD

# Description
로그인,회원가입,마이페이지,메인 페이지로 구성

# Creation Period
2022-09-04 ~ 09-17

# Features
* JSON을 활용한 axios,Ajax처리
* express의 GET,POST 요청처리
* RESTful API의 GET,POST,PUT,DELETE 사용
* View engine을 활용한 라우팅 처리
* PassPort를 사용한 사용자 인증 구현
* middleware의 localStrategy 사용 구현
* 세션만료를 통한 로그아웃처리
* MongoDB 연동을 통한 회원 데이터베이스 구현
* Cloudinary 사용하여 이미지 저장 
데이터
# Development(important part)
+ Password데이터베이스 연동 
  + passport.initialize(), passport.session() 통해서 passport를 미들웨어로 등록했습니다. 로그인에 성공할 시 serializeUser 메서드를 통해서 사용자 정보를 Session에 저장인증이 완료되고 페이지 이동시 deserializeUser 메서드가 호출합니다.

![로그인](https://user-images.githubusercontent.com/102776957/190355394-47d3d32c-d43c-433f-95c3-a69715da3a42.jpg)

* 수정
  * 수정부분을 클릭했을때 가상의 폼을 구현하여(new FormData()) JSON구조로 KEY,VALUE (키와 값) 구조로 데이터를 전송했습니다.

![메인페이지 – 1](https://user-images.githubusercontent.com/102776957/190359807-c273a017-8bf7-48ca-a11c-a58f008b2e4f.jpg)
``` C
          // 수정 작업
          const modifyImgFile = document.querySelector("#modifyImg");
          const modifyTitle = document.querySelector("#title");
          const modifyDate = document.querySelector("#date");
          const modifyDesc = document.querySelector("#desc");
          const modifyPoint = document.querySelector("#point");

          //btnjoin 확인버튼/작업
          const btnJoin = document.querySelector("#btnJoin");
          btnJoin.addEventListener("click", (e) => {
            const formData = new FormData();
            formData.append("modifyImg", modifyImgFile.files[0]);
            formData.append("title", modifyTitle.value);
            formData.append("date", modifyDate.value);
            formData.append("desc", modifyDesc.value);
            formData.append("point", modifyPoint.value);
```
##server deployment : https://seoulboard.herokuapp.com/login
