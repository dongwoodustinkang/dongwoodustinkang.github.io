---
title: "Attention Is All You Need"
author: "Ashish Vaswani et al."
affiliation: "NeurIPS 2017"
venue: "2017"
---

# Transformer


## 왜 딥러닝 역사의 중심이 되었는가

A.I. 관련 공부를 해본 사람이라면 Transformer라는 이름을 한 번쯤은 들어봤을 것이다. 나에게 이 논문은, 회사에 입사한 뒤 처음으로 동료 및 상사분들 앞에서 발표했던 논문 리뷰이기도 하다.

구조 자체는 비교적 단순하지만, Transformer는 이후 BERT, GPT, T5 등 수많은 모델의 출발점이 되었고 현재는 대규모 언어 모델(LMM) 아키텍처를 사실상 정의했다.

이 포스트에서는 단순한 논문 요약이 아니라, 당시 발표를 준비하며 정리했던 관점과 함께 **[Attention Is All You Need](https://arxiv.org/abs/1706.03762)** 논문이 왜 딥러닝 역사에 중요한 전환점이었는지를 다시 정리해보고자 한다

## 그 동안의 문제점

2017년 당시, RNN(Recurremt Neural Net) 기반 시퀀스 모델은 언어 모델링과 기계번역 분야에서 거의 정설에 가까운 접근법이었다. 여기에 초기 형태의 Attention을 보조 장치로 사용하는 것이 최선이었다.

Attention 이전의 구조는 현재상태(`h_t`)를 알기 위해 반드시 이전 상태(`t-1`)가 계산될 때까지 기다려야 한다. 이 구조는 시간 순서에 따라 정보를 누적할 수 있다는 장점이 있으나 치명적인 구조적 한계를 가지고 있었다.


1. 순차적 구조의 문제
2. 학습 효율성의 문제
3. 장거리 의존성


문제는 문장이 길어지는 경우 계산 시간이 선형적으로 증가하며 앞 부분의 정보가 점점 희석되는 경우이다. 물론 LSTM의 Cell State와 Gate 구조 도입으로 장거리 의존성의 문제를 해결할 수 있었지만 여전히 병렬적 계산이 불가능하다는 문제를 벗어날 수 없었다.

 Transformer는 문제 정의 자체를 바꾸었다. 
**순환 구조를 완전히 제거하고 Attention만으로 직접 모델링하는 구조**를 제안했다. Transformer의 완전 병렬성 덕분에 문장 내 토큰을 동시에 처리할 수 있었고 실제 논문에 P100 GPU 8장으로 단 12시간 학습만으로 기존 SOTA 성능을 갈아 치울 수 있었다(그당시).


![Recurrent 모델과 Transformer 모델의 차이 : 순차 처리 vs 병렬처리](assets/images/stories/attention-is-all-you-need/image-1.png)

논문에서 제시한 `Table 1`을 보면 그 차이가 명확하다.

![Table1: Maximum path lengths, per-layer complexity and minimum number of sequential operations for different layer types.](assets/images/stories/attention-is-all-you-need/table-1.png)


## 아키텍처
논문에서 나온 Transformer에 아키텍처는 다음 그림과 같다.

좌측엔 Encoder, 우측엔 Decoder이다. 훗날 이 Encoder 부분은 BERT, Decoder 부분은 GPT로 발전하게 된다.

해당 포스트에서는 아키텍처 전체를 자세히 다루지 않을 것이다. 필요한 부분은 링크로 남겨두었으니 참고해도 좋을 것 같다.

![Transformer Architecture](assets/images/stories/attention-is-all-you-need/image-2.png){width=50%}

#### Positional Encoding
Transformer는 모든 단어를 한번에 병렬로 쏟아 붓는다.

이렇게 되면 모델 입장에서는 `‘I LOVE YOU’`와 `‘YOU LOVE I’`를 구분할 수 없게 된다. 즉, 순서 정보가 없기 때문이다. 해당 논문에서는 입력 임베딩에 Positional Encoding Vector를 더해주는 방식을 택했다. 두 벡터는 반드시 같은 차원이어야 더할 수 있다.

![Positional Encoding](assets/images/stories/attention-is-all-you-need/image-3.png)

#### Attention
transformer 모델에서는 3가지의 각기 다른 Attention 모델이 사용된다. Encoder에서는 Multi-Head Attention(Self Attention)이 사용되고 Decoder에서는 Masked Multi-Head Attetion이 사용되며 그 둘을 잇는 Encoder-Decoder Attetion이 사용된다.

1. Self Attention
2. Masked Multi-Head Attention
3. Encoder-Decoder Attention

Self Attetion은 입력 문장 내의 **단어들끼리 관계를 파악**하는 방식이다. 처음엔, 입력 벡터(X)를 Query, Key, Value 세 갈래로 나눈다. 이때 head의 수만큼 가중치를 쪼개 병렬처리한다. head 수 만큼 차원을 작게 쪼개는 이유는 서로 다른 관점으로 해석하기 위함이다.

그 다음, **Scaled Dot Product Attention**에서 Query와 Key를 유사도 계산을 위해 내적한다. 계산된 값을 학습 안정성을 위해(기울기 소실 방지) 스케일링을 진행한다. 점수들을 0~1사이의 확률값으로 변환해 다른 단어들 간의 중요도를 파악한다. 마지막으로 Value값을 곱해 최종 벡터를 획득한다.

획득한 벡터는 각 Head에서 독립적으로 계산된 결과를 하나로 이어 붙인다(Concat). 이어 붙인 결과 행렬을 가중치 행렬(W)을 곱해 원래 차원으로 되돌린다.

![](assets/images/stories/attention-is-all-you-need/image-4.png)

Masked Multi-Head Attention은 Decoder 부분에 있는 Attention이다. 입력값으로는 정답 문장이 입력되며 미리 단어를 보고 예측하면 안되기 때문에 현재 시점보다 뒤에 있는 단어들에는 −∞을 씌워 Softmax 결과가 0이 되도록 만든다. 즉, 오직 이전 시점의 단어들만 참고하게 만드는 것이다.

![](assets/images/stories/attention-is-all-you-need/image-5.png)

Encoer-Decoder Attention은 현재 만들고 있는 단어(Q)와 가장 관련 깊은 인코더의 단어(K)을 찾아 정보(V)를 가져온다.

- Query(Q) : 디코더의 이전 층 출력값
- Key(K), Value(V): 인코더의 최종 출력 값

#### Add & Norm, Feed-Forward
Transformer의 모든 서브 레이어 뒤에는 FeedForward-Dropout-Add-Normalize 과정이 존재한다.

Attention 층에서 나온 벡터가 들어오면 첫번째 선형 변환으로 4배 확장하고 ReLU 활성화 함수로 비선형성을 부여한 다음, 다시 두번째 선형변환으로 원래 차원으로 압축한다.

- Dropout : 과적합을 방지하기 위함.
- Layer Normalization : 정보 손실 방지와 학습 효율 증대를 위해 원본값을 더하고 매끄러운 학습 곡선을 만든다.


마지막으로, 디코더의 출력 벡터를 단어 집합 만큼 확장 한후 점수(Logits)을 매긴다. 그 다음, 그 점수를 확률로 변환한 다음 가장 높은 단어가 최종 예측 단어가 되는 것이다.

![](assets/images/stories/attention-is-all-you-need/image-6.png)

## Result
결과적으로 Transformer는 번역 뿐만아니라 다른 NLP Task에도 잘 적용되는듯 하다. 다른 모델보다 F1Score 91.3~92.7을 기록하며 Transfomer는 번역 기계가 아니라 언어의 구조 차제를 이해하는 범용적인 모델임을 증명했다.

![Model Translation & Model Variation](assets/images/stories/attention-is-all-you-need/table-2.png)

입사 후 첫 발표를 위해 Attention Is All You Need를 뜯어보며, 기존의 고정관념(RNN)을 깨부수고 **“Attention만으로 충분하다”** 고 말함의 증거였다.

병렬 처리를 통한 효율성, 그리고 장기 의존성 문제의 해결. 이 두 가지 열쇠는 이후 BERT와 GPT라는 거대한 흐름을 만들어냈다. 모든 LLM의 시작점에 바로 이 논문이 있다. AI를 공부한다면, 수식 하나하나를 짚어가며 꼭 한 번 정독해 볼 가치가 있는 논문이다.
