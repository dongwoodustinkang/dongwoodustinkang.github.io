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
assets/images/toy-projects/toy23-03.png
assets/images/toy-projects/toy23-04.png
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


## 다도결 (2023)

#### 개요
> 전통 차 문화를 일상에 가져오는 iOS 다도 가이드 앱
바쁜 현대인이 차를 통해서 잠시 멈추고 고요함을 찾을 수 있도록, 단계적으로 다도하는 방법을 안내하는 앱이다. 차에 익숙하지 않는 사용자도 쉽게 다도를 즐길 수 있도록 제작하였다.

- 플랫폼 : iOS 16+
- 개발 기간 : 2023년
- 기술 : SwiftUI

#### Interactive Step Indicator
상단 점표시 인디케이터를 롱 프레스하면 인디케이터가 확장되면서 단계별 이름이 표시되고, 슬라이드하면서 원하는 단계로 직접 이동할 수 있게 편의성을 개선하였다. 
롱프레스, 선택 변경, 손 뗌등의 시점에 각각 다른 강도의 햅틱을 적용하여 자연스러운 물리 피드백을 구현하였다.

#### 서브 페이지 `ScrollView`가 스크롤되지 않는 문제
- 배경
UnsureFlowView에서 Color.clear.frame(maxWidth: .infinity)에 contentShape(Rectangle())을 붙여 백 스와이프 제스처를 등록했더니, 전체 화면이 제스처 히트 영역이 되어 그 위에 얹힌 TeaInfoView / DadoInfoView의 ScrollView 터치를 가로챘습니다.

- 해결
제스처 히트 영역을 화면 왼쪽 30pt 스트립으로 제한했습니다. HStack { Color.clear.frame(width: 30).contentShape(Rectangle()).gesture(...); Spacer() } 패턴을 쓰면 Spacer()가 나머지 영역의 터치를 통과시켜 ScrollView가 정상 동작합니다.

```swift
HStack(spacing: 0) {
    Color.clear
        .frame(width: 30)
        .contentShape(Rectangle())
        .gesture(backSwipeGesture)
    Spacer()
}
.frame(maxHeight: .infinity)
```

#### 타이머 로직 중복
- 배경
전통 다도의 침출 단계와 티백 침출 단계가 각각 별도 타이머 뷰를 갖고 있었습니다. 두 뷰는 제목 문자열과 프리셋 목록만 다를 뿐 레이아웃·TimerState 바인딩·카운트다운 링·MagneticSlider 로직이 동일해서, 한 쪽을 수정하면 다른 쪽도 따로 수정해야 했습니다.

- 해결
title, subtitle, waitingText, presets를 외부에서 주입받는 `MagneticTimerView` 하나로 통합했습니다. 두 뷰가 동일한 컴포넌트를 다른 파라미터로 호출하도록 변경해 코드를 단일 진실 원천으로 관리합니다.
