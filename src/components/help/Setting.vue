<script setup>
import '../../assets/css/help-style.css'

function openBrowser(link) {
  window.winAPI.openBrowser(link);
}
</script>

<template>
  <div id="container">
    <div>
      <div class="box">
        <h5>- 반영 대상 프로젝트 경로</h5>
        <div class="explanation">
          <p>추출한 파일들을 반영할 프로젝트의 루트 경로 (운영환경의 경로)</p>
          <p>절대경로로 작성해주세요.</p>
        </div>
      </div>
      <div class="box">
        <h5>- class 파일 자동 탐색</h5>
        <div class="explanation">
          <p>Java 언어로 개발된 프레임워크에서 사용할 수 있는 기능입니다.</p>
          <p>컴파일된 Java 파일로부터 생성된 클래스 파일을 파일이름과 경로를 비교하여 자동으로 탐색합니다.</p>

          <p style="margin-top: 20px;">class 파일이 생성되는 경로를 자세히 작성할수록 탐색 속도가 향상됩니다.</p>
        </div>
      </div>
      <div class="box">
        <h5>- 경로 변경 설정</h5>
        <div class="explanation">
          <p>개발환경과 운영환경에서 프로젝트 내의 경로가 서로 다를 경우 사용할 수 있는 기능입니다.</p>
          <p>선택된 프리셋의 설정대로 경로를 변경하여 반영파일을 생성합니다.</p>
        </div>
      </div>
      <div class="box">
        <h5>- 프리셋 작성방법</h5>
        <div class="explanation">
          <p>왼쪽의 입력창에는 변경을 원하는 개발환경의 경로를 입력해주세요.</p>
          <p>오른쪽의 입력창에는 매핑을 원하는 운영환경의 경로를 입력해주세요.</p>
        </div>
      </div>
    </div>
    <div class="my-info-box">
      <a id="blog-link" @click="openBrowser('https://bom-b.tistory.com/45')">더 자세한 사용방법은 블로그를 참고해주세요.</a>
      <div class="contact-box">
        <i class="fa-brands fa-github"></i>
        <p style="color: rgba(246, 246, 246, 0.64)">github : </p>
        <p id="github-link" @click="openBrowser('https://github.com/bom-b/patch_file_builder')">https://github.com/bom-b/patch_file_builder</p>
      </div>
      <div class="contact-box">
        <i class="fa-regular fa-envelope fa-lg"></i>
        <p style="color: rgba(246, 246, 246, 0.64)">contact : </p>
        <p style="color: rgb(93,131,220)">developer.bombi@gmail.com</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>