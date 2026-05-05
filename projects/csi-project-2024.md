---
title: "하드웨어 노이즈 극복을 위한 채널신호(CSI) 정제 및 전처리 최적화"
author: "Contents Convergence Research Center"
affilation: Korea Electronics Technology Institute(KETI)
venue: "2024 Korea Electronics Technology Institute(KETI)"
Links:
- Paper: https://ieeexplore.ieee.org/
---

## Show
assets/images/csi-project-2024/csi24-01.png

## Overview
Wi-Fi 기반 비접촉 행동 인식 시스템에서 발생하는 하드웨어 노이즈를 SVD(Singular Value Decomposition) 분해를 활용해 효과적으로 정제하고, 경량 딥러닝 모델이 동작하는 Edge AI 환경에서의 추론 성능을 향상시키는 전처리 파이프라인을 제안합니다.

## Abstract
Wi-Fi CSI(Channel State Information) 신호는 사람의 움직임에 민감하게 반응해 비접촉 행동 인식에 활용될 수 있으나, 다중경로 간섭·하드웨어 오프셋·주변 환경 노이즈로 인해 신호 품질이 저하되는 문제가 있습니다. 본 연구는 SVD 기반 정적 성분 제거와 STFT 기반 시간-주파수 표현을 결합한 전처리 파이프라인을 설계하여 경량 DL 모델의 분류 정확도 및 Edge 추론 속도를 동시에 개선하는 방법을 제안합니다.


## Problem Definition

#### 하드웨어 노이즈로 인한 신호 품질 저하
상용 Wi-Fi 칩셋은 하드웨어 특성상 위상 오프셋·주파수 오프셋·타이밍 오프셋 등 다양한 잡음을 CSI 측정값에 혼입시킵니다. 이를 보정하지 않으면 행동 인식 모델의 입력 품질이 심각하게 훼손됩니다.

#### 정적 성분과 동적 성분의 혼재
CSI 신호에는 사람의 움직임(동적 성분)과 벽·가구 등 고정 환경(정적 성분)이 함께 포함됩니다. 두 성분을 분리하지 않으면 행동 분류 모델이 불필요한 정보를 학습하게 됩니다.

#### Edge 환경에서의 추론 효율 제약
IoT·임베디드 장치에 모델을 배포할 때는 연산량과 메모리 제약이 크기 때문에, 전처리 단계에서 입력 신호를 효과적으로 압축·정제하는 것이 필수적입니다.

## Contribution

#### SVD 기반 정적 성분 제거
CSI 진폭 행렬에 SVD를 적용해 상위 특이값에 해당하는 정적 성분을 분리·제거하고, 동적 행동 성분만을 추출합니다. 이를 통해 분류 모델이 집중해야 할 특징을 명확히 분리할 수 있습니다.

#### STFT 기반 시간-주파수 표현 생성
정제된 CSI 신호에 STFT를 적용해 스펙트로그램 형태의 2D 입력을 생성합니다. 경량 CNN 아키텍처가 시간-주파수 패턴을 효율적으로 학습할 수 있도록 입력 표현을 최적화합니다.

#### 전처리 파이프라인 설계 및 성능 검증
제안된 전처리 파이프라인을 적용했을 때 대비 미적용 대비 행동 인식 정확도와 Edge 추론 지연 감소 효과를 실험적으로 검증합니다.

## Solution Design

전처리 파이프라인은 다음 단계로 구성됩니다.

- **노이즈 보정**: 위상 오프셋·타이밍 오프셋을 선형 보간 방식으로 교정
- **SVD 분해**: 서브캐리어별 진폭 행렬에 SVD 적용 후 상위 k 특이값 제거
- **STFT 변환**: 슬라이딩 윈도우 적용 후 스펙트로그램 생성
- **정규화**: Min-Max 정규화를 통해 모델 입력 스케일 통일

## Reflection
이번 연구를 통해 딥러닝 모델의 성능은 아키텍처 개선만큼이나 입력 데이터의 품질에 크게 의존한다는 점을 체감했습니다. 신호 처리 기반의 전처리가 Edge 환경에서 모델 경량화 대비 실질적인 효율 향상을 가져올 수 있음을 확인할 수 있었습니다.

## Publications
### 하드웨어 노이즈 극복을 위한 채널신호(CSI) 정제 및 전처리 최적화
- Authors: Dongwoo Kang, Hyunsu Jang, Sunghwan Kim
- Venue: ICTC 2024
- Abstract: SVD 기반 정적 요소 제거 및 STFT 변환을 결합한 전처리 파이프라인으로 Wi-Fi CSI 기반 행동 인식의 분류 정확도와 Edge 추론 성능을 동시에 향상시키는 방법을 제안합니다.
