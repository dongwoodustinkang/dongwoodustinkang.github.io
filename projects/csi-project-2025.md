---
title: "고도화된 데이터 전처리와 CSI 기반 온디바이스 AIoT 시스템 개발"
author: "Content Convergence Research Center"
affilation: Korea Electronics Technology Institute(KETI)
venue: "2025 Korea Electronics Technology Institute(KETI)"
Links:
- Paper: https://ieeexplore.ieee.org/document/11263593
- DEMO: https://youtu.be/35QwhL_oh_Q
- Github : https://github.com/thkimKETI/csi-sensing
---

## Show
assets/images/csi-project-2025/csi25-00.png
assets/images/csi-project-2025/csi25-01.png
assets/images/csi-project-2025/csi25-02.png
assets/images/csi-project-2025/csi25-03.png
assets/images/csi-project-2025/csi25-04.png
assets/images/csi-project-2025/csi25-05.png


## Overview
3차년도에는 다중 수신기 및 엣지 컴퓨팅 환경으로 시스템을 확장했습니다. 시퀀스 시간 정렬 기법을 이용한 동일 시간대 다중 데이터 수집과 안드로이드/리눅스 환경에서 AI 추론이 가능하도록 설계 및 제작하였습니다. 더불어 경량화된 AI 모델(TinyCNN, SVM, Attention)을 엣지 디바이스에 성공적으로 포팅하여 TTA 공인시험에서 96% 이상의 압도적인 행동 감지 정확도를 공식 인증 받는등, 하드웨어의 한계를 소프트웨적 역량으로 완벽히 극복해 냈습니다.

## Show
<iframe width="560" height="315" src="https://www.youtube.com/embed/35QwhL_oh_Q?si=BLU99dcGeCglYry6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Problem Definition

#### 다중 수신기 확장에 따른 타임스탬프 비동기화 한계
단일 수신기(ESP32-S3)를 사용하던 환경에서 제한된 송수신 영역에 의해 **사각지대(Dead Zone) 문제**가 발생했습니다. 이를 해결하고 공간적 다양성(Spatial Diversity)를 확보하고자 수신기를 최대 4대로 연동하는 다중 수신기 시스템으로 환경을 확장하게 되었습니다. 그러나 기기별로 패킷 처리 및 통신 지연 시간이 달라 서버에 도달하는 데이터의 시점이 어긋나는 현상이 발생했습니다. 동기화되지 않은 융합 데이터를 학습할 경우 모델의 분류 정확도가 급감하는 것을 확인할 수 있었습니다.

#### 모바일 엣지 환경의 극심한 연산 및 메모리 한계
데스크탑 환경이 아닌 스마트폰이나 태블릿 PC, 홈 허브와 같은 모빌리티 환경의 엣지 디바이스는 고성능 서버에 비해 **연산 능력과 메모리가 턱없이 부족**합니다. 초기 연구되었던 트랜스포머(Transformer)와 같이 무겁고 복잡한 시계열  모델을 사용할 경우 엣지 환경에서는 치명적인 추론 지연이 발생할 수 있으며, 다중 센서 입력 시 차원 증가로 인해 과적합(Overfitting) 현상이 심화되는 한계가 있었습니다.

## Solution Process

#### TimeLocked 기반 시간 정렬 알고리즘 고안
각 장치의 타임스탬프를 비교하여 가장 늦게 도착한 시각을 기준으로 대기시키는 TimeLocked Process 개념과 지연으로 비어버린 틈을 채우는 선형 보간법(Linear Interpolation)을 결합한 **시퀀스 시간 정렬 기법**을 고안했습니다. 이를 통해 0.1초 단위로 9개의 패킷이 균일하게 정렬하여 2초 단위의 완벽히 동기화된 융합 CSI 블록을 생성했습니다. 그 결과 다중 수신기 환경에서의 인식 정확도를 대폭 끌어올렸으며, 이 해결 성과를 바탕으로 국제 학술대회에 논문을 제1저자로 발표하여 학술적 성과를 입증했습니다.

#### 리눅스 기반 MQTT 스트리밍 파이프라인 설계 및 안드로이드 풀스택 구현
만약 클라우드 서버에 전적으로 의존하게 되는 경우 네트워크 통신 지연이나 사생활 침해 우려가 있으므로 로컬 네트워크에서 구동되는 엔드투엔드(End-to-End) 아키텍처를 설계했습니다. 경량 IoT 프로토콜인 **MQTT를 사용하여 토픽을 실시간으로 스트리밍하는 데이터 수집 파이프라인**을 구축했습니다. 또한 데이터 병목 현상을 방지하기 위해 기존의 시스템을 모듈단위로 리팩토링하고 독립된 프로세스로 분리하여 **병렬 아키텍처**를 구현했습니다. 나아가 전처리 로직과 추론 로직을 **안드로이드 환경**에 1:1로 이식해 인터넷 연결없이 모바일 단말에서 실시간 수집 및 데이터 처리가 이루어지는 시스템을 완성했습니다. 

#### 경량화한 TinyCNN 모델 설계, TF Lite 자동화 포팅
엣지 환경에 적합한 모델로TinyCNN과 SVM 분류 모델을 설계했습니다. 수만개의 파라미터를 다이어트한 후 이 모델들을 PyTorch로 학습하고 **엣지 환경에 맞게 구동시키기 위해 ONNX를 거쳐 엣지 환경에 적합한 모델**으로 변환하였습니다. 복잡도를 덜어낸 경량 모델들은 안드로이드 앱 내부에 성공적으로 포팅하였으며 안드로이드 CPU 환경만으로 실시간 병렬 추론이 가능해졌습니다. 

| | 행동 감지 | 인원수 | 위치 |
| - | - | - | - |
| 수신기 2대 | 95.52% | 89.64% | 99.5% |
| 수신기 4대 | 97.78% | 96.67% | 99.62% |

## Contribution

#### 하드웨어의 한계를 소프트웨어로 극복한 시간 정렬 알고리즘으로 ICCE-Asia 2025 포스터 논문 발표
4대의 수신기를 연동하며 겪었던 시간 비동기화 및 패킷 도달 문제를 '소프트웨어 아키텍처 설계'와 '시간 정렬 알고리즘'으로 극복해 낸 과정이 단순한 에러 수정을 넘어 학술적 가치를 지니고 있었습니다. 저는 제가 직접 고안한 이 동기화 알고리즘이 AI 인식률 향상에 얼마나 정량적으로 기여했는지 분석하여 개인적인 학술 성과로 확장했습니다.
해당 연구는 ["Robust Wifi Channel State Information-based Localization via Sequence Time Alignment"](https://ieeexplore.ieee.org/document/11263593)라는 제목으로 국제 학술대회인 IEEE/IEIE ICCE-Asia 2025에서 포스터로 발표되었습니다.

```
D. Kang, et al., "Robust WiFi Channel State Information-Based Localization via Sequence Time Alignment," 2025 IEEE/IEIE International Conference on Consumer Electronics-Asia (ICCE-Asia), Busan, Korea, Republic of, 2025, pp. 1-3, doi: 10.1109/ICCE-Asia67487.2025.11263593. 
```