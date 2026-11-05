---
title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
author: "Alexey Dosovitskiy et al."
affiliation: "ICLR 2021"
venue: "2021"
---

# Vision Transformer (Alexey Dosovitskiy et al.)

## Computer Vision 분야에 Transformer를 적용하다.

> 대규모의 사전학습 데이터일수록 압도적인 성능을 내는 이미지를 위한 트랜스포머 모델입니다.

Vision Transformer(ViT) 모델은 자연어 분야에서 이미 좋은 성적을 낸 Transformer의 Encoder를 잘 사용한 객체 탐지 및 이미지 분류 모델이다.
해당 논문에서는 간단한 모델 구조 설명과 함께 이전의 모델들이 어떠한 노력을 했는지 ViT가 CNN 기반 모델에 비해 성능이 얼마나 좋은지를 설명한다. 

## ViT가 등장하기 전

Vision Transformer가 등장하기 전 대표적인 Vision 모델로는 CNN, ResNet이 있다.
CNN은 "가까운 픽셀끼리는 관련이 깊다"(Locality)와 "위치가 바뀌어도 특징은 같다"(Translation Equivariance)는 강력한 귀납 편향(Inductive Bias)를 아키텍쳐 자체에 내장하고 있다. 덕분에 적은 양의 데이터로도 이미지의 공간적 구조를 빠르게 학습할 수 있지만 데이터가 커져버리면 이 편향은 오히려 모델의 표현력과 성능 확장을 제한하기도 한다.

#### Inductive Bias
학습 모델이 지금까지 만나보지 못했던 상황에서 정확한 예측을 하기위해 추가적인 가정을 하는 것을 의미한다.
그 가정이 맞으면 좋은 성능을 줄 수 있지만 틀리게 되면 더 떨어지게 된다.
예를 들면, CNN은 지역성이라는 가정을 통해 가까이 있는 정보를 활용해 공간적(Spatial)한 문제를 푼다. 또한, RNN은 순차성(Sequentiality)라는 가정을 활용해 시계열 문제를 푼다.

![Table 1](https://i.sstatic.net/QbD58.png)

[참고자료](https://robot-vision-develop-story.tistory.com/29)


#### 다양한 시도
그 당시 Vision 분야의 가장 최고의 성적은 ResNet 이었다. 
Vision Task에도 Self-Attention을 적용하려는 많은 시도들이 있었지만 GPU와 같은 하드웨어 이슈로 효율적이지 못한 성능을 나타냈다. 그러나 ViT는 Transformer Encoder 아키텍처를 그대로 사용하는 방식이다.

## ViT Architechture
ViT의 핵심 아이디어는 이미지를 작은 패치 단위로 묶고, 각 패치를 하나의 토큰처럼 처리하는 것이다. 
![ViT 모델 아키텍처 - 발표 자료](assets/images/stories/ViT/model.png)

#### Patch Embedding
시각적인 설명은 [해당 게시물](https://discuss.pytorch.kr/t/vision-transformer-a-visual-guide-to-vision-transformers/4158)을 보면 잘 나와있긴 하다. 조금 간추려서 설명하자면, 이미지를 패치 단위로 쪼갠 다음 평탄화를 진행한다. 그다음, 선형 변환을 통해 고정된 크기 $d$라는 패치 임베딩 벡터로 인코딩 한다. 
