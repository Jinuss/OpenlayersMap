<script setup lang="ts">
const githubLink = "https://github.com/Jinuss/maps";
</script>
<template>
  <a :href="githubLink" class="iss-github-corner" title="求个star"><i></i></a>
</template>
<style scoped>
a.iss-github-corner,
a.iss-github-corner-left {
  font-size: 1.8em;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  color: var(--primary-color);
  background-color: var(--primary-text-color);
  padding: 0.5em 1.8em 0;
  text-align: center;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  -webkit-transform-origin: 3.9em 3em;
  -ms-transform-origin: 3.9em 3em;
  transform-origin: 3.9em 3em;
  overflow: hidden;
}

a.iss-github-corner-left {
  left: 0;
  right: auto;
  -webkit-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
  -webkit-transform-origin: 1em 3.1em;
  -ms-transform-origin: 1em 3.1em;
  transform-origin: 1em 3.1em;
}

a.iss-github-corner:hover i,
a.iss-github-corner-left:hover i {
  -webkit-animation: vertical 2s ease;
  animation: vertical 2s ease;
}

a.iss-github-corner i,
a.iss-github-corner-left i,
i.iss-github-corner {
  color:var(--primary-color);
  position: relative;
  display: inline-block;
  font-style: normal;
  background-color: currentColor;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  vertical-align: middle;
  width: 0.8em;
  height: 0.6em;
  -webkit-border-radius: 45% 45% 45% 45% / 50%;
  border-radius: 45% 45% 45% 45% / 50%;
  background-color: currentColor;
  -webkit-box-shadow: 0 0.35em 0 -0.2em, 0 0.38em 0 -0.2em, 0 0.41em 0 -0.2em,
    0 0.44em 0 -0.2em, 0 0.47em 0 -0.2em;
  box-shadow: 0 0.35em 0 -0.2em, 0 0.38em 0 -0.2em, 0 0.41em 0 -0.2em,
    0 0.44em 0 -0.2em, 0 0.47em 0 -0.2em;
  margin: 0.12em 0.1em 0.23em;
}

a.iss-github-corner i:before,
a.iss-github-corner-left i:before,
i.iss-github-corner:before {
  content: "";
  border-width: 0;
  position: absolute;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-width: 0.15em 0.15em;
  border-style: solid;
  -webkit-border-radius: 0.02em 60% 100% 80%;
  border-radius: 0.02em 60% 100% 80%;
  left: 0;
  top: -0.07em;
  -webkit-transform: rotate(20deg);
  -ms-transform: rotate(20deg);
  transform: rotate(20deg);
}

a.iss-github-corner i:after,
a.iss-github-corner-left i:after,
i.iss-github-corner:after {
  content: "";
  border-width: 0;
  position: absolute;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  border-width: 0.15em 0.15em;
  border-style: solid;
  -webkit-border-radius: 0.02em 80% 100% 60%;
  border-radius: 0.02em 80% 100% 60%;
  left: 0.5em;
  top: -0.07em;
  -webkit-transform: rotate(65deg);
  -ms-transform: rotate(65deg);
  transform: rotate(65deg);
}

@-webkit-keyframes vertical {
  0% {
    -webkit-transform: translate(0, -3px);
    transform: translate(0, -3px);
  }

  4% {
    -webkit-transform: translate(0, 3px);
    transform: translate(0, 3px);
  }

  8% {
    -webkit-transform: translate(0, -3px);
    transform: translate(0, -3px);
  }

  12% {
    -webkit-transform: translate(0, 3px);
    transform: translate(0, 3px);
  }

  16% {
    -webkit-transform: translate(0, -3px);
    transform: translate(0, -3px);
  }

  20% {
    -webkit-transform: translate(0, 3px);
    transform: translate(0, 3px);
  }

  22%,
  100% {
    -webkit-transform: translate(0, 0);
    transform: translate(0, 0);
  }
}

@keyframes vertical {
  0% {
    -webkit-transform: translate(0, -3px);
    transform: translate(0, -3px);
  }

  4% {
    -webkit-transform: translate(0, 3px);
    transform: translate(0, 3px);
  }

  8% {
    -webkit-transform: translate(0, -3px);
    transform: translate(0, -3px);
  }

  12% {
    -webkit-transform: translate(0, 3px);
    transform: translate(0, 3px);
  }

  16% {
    -webkit-transform: translate(0, -3px);
    transform: translate(0, -3px);
  }

  20% {
    -webkit-transform: translate(0, 3px);
    transform: translate(0, 3px);
  }

  22%,
  100% {
    -webkit-transform: translate(0, 0);
    transform: translate(0, 0);
  }
}
</style>
