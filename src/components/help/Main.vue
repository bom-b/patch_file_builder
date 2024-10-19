<script setup>
import '../../assets/css/help-style.css'

function openBrowser(link) {
  window.winAPI.openBrowser(link);
}
</script>

<template>
  <div id="container">
    <div>
      <div class="box" style="margin-bottom: 70px;">
        <p>CI/CD 구성이 어려운 환경에서 수정한 파일의 반영을 도와주는 프로그램 입니다.</p>
        <p>프로그램을 통해 수정한 파일을 쉽게 추출하고 반영할 수 있습니다.</p>
      </div>
      <div class="box">
        <h5>- 작업 프로젝트 경로</h5>
        <div class="explanation">
          <p>파일을 추출할 프로젝트의 루트 경로 (개발환경의 경로)</p>
          <p>절대경로로 작성해주세요.</p>
        </div>
      </div>
      <div class="box">
        <h5>- 파일을 복사할 경로</h5>
        <div class="explanation">
          <p>추출한 파일을 복사할 경로</p>
          <p>절대경로로 작성해주세요.</p>
          <p>경로가 실제로 존재하지 않아도 작성한 경로대로 폴더를 생성합니다.</p>
        </div>
      </div>
      <div class="box">
        <h5>- 파일 경로 추가</h5>
        <div class="explanation">
          <p>추출을 원하는 파일의 경로를 작성해주세요.</p>
          <p>절대경로 또는 상대경로로 작성할 수 있습니다.</p>

          <p style="margin-top: 20px;">- 절대 경로: 작업 프로젝트 경로를 포함한 전체 경로</p>
          <p>- 상대 경로: 작업 프로젝트 경로를 기준으로 한 경로</p>

          <p style="margin-top: 20px;">경로 추가 후 추출을 원하는 파일을 체크박스를 통해 선택 할 수 있습니다.</p>
        </div>
      </div>
      <div class="box">
        <h5>- 원본 경로 보기 / 변경될 경로 보기</h5>
        <div class="explanation">
          <p>경로 변경 설정에서 지정한 프리셋을 통해 최종적으로 변경될 경로를 미리 볼 수 있습니다.</p>
        </div>
      </div>
    </div>
    <div class="my-info-box">
      <a id="blog-link" @click="openBrowser('https://bom-b.tistory.com/')">더 자세한 사용방법은 블로그를 참고해주세요.</a>
      <div class="contact-box">
        <i class="fa-brands fa-github"></i>
        <p style="color: rgba(246, 246, 246, 0.64)">github : </p>
        <p id="github-link" @click="openBrowser('https://github.com/bom-b/patch_file_builder')">
          https://github.com/bom-b/patch_file_builder</p>
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