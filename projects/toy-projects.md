---
title: "Toy projects for my birthday"
author: "Dongwoo Kang"
affilation: "Dongwoo Kang"
venue: "TOY PROJECT"
Links:
- 2026: https://birthdaygame-8e431.web.app/
---

## Show
assets/images/toy-projects/toy26-01.png
assets/images/toy-projects/toy26-02.png

## Overview


## 하늘에서 음식이 내린다면 (2026)
#### 배경
처음엔 VanilraJS로 작성하고 프레임워크는 사용하지 않았다. 단지, 웹프로그래밍 시간 때 배운 내용을 총 동원해서 직접 구현해보고자 했다. 

#### 핵심 구현
가장 중요하게 다루었던 부분은 가중치 기반으로 내려오는 아이템들의 등장 횟수를 판별하는 구조이다. 
예를 들어, 아이템의 누적 가중치를 순차적으로 빼면서 0이하가 되면 아이템을 반환하는 방식이다. 이를 적당히 조절하기 위해 많은 수정과 테스트가 필요했다. 
- 가중치 기반 랜덤 아이템 선택
- requestAnimationFrame 기반 게임 루프
- 충돌 감지 알고리즘
- 스케줄 기반 특수 아이템 등장
- Github Pages 베포

#### LLM을 통한 개선(2026)
3년이 지나 이 프로젝트를 다시 열어보고 Claude를 통해 다시 개선을 진행했다. 
우선 전반적인 디자인 시스템을 재 개선하였다. 해당 게임은 인터넷에서 가져온 이미지를 사용하였고 디자인이 제각각이었다. 캐릭터나 인터페이스등을 LLM을 통해 생성하여 오히려 일관성을 갖춘 디자인을 만들었다. 또한, 사람들에게 직접 게임을 공유하고 리더보드를 반영하기 위해 Firebase를 연동했다. 이 또한 LLM과 관련 툴에게 맡기었다.
- 디자인 시스템 재구축
- 게임 코드 리팩토링 (오디오 관리, 객체 정리, 함수 단위 분리)
- Firebase 연동

