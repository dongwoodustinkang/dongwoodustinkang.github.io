---
title: "AI Agent 기반 대화형 협업 도구 솔루션"
author: "Minji Kim, Dongwoo Kang, Ha-Eun Kwon"
affilation: CIT HCI College
venue: "HCI College Conference 2024"
Links:

* Paper: https://www.companoid.institute/achievement-project/goget
* News: https://platum.kr/archives/247782
---

# 생산성 향상을 위한 인공지능 기반 대화형 협업 도구 솔루션 제안

## Show
assets/images/collab-ai-agent-hci-2024/24_02_thumnail.avif
assets/images/collab-ai-agent-hci-2024/24_02_01.png
assets/images/collab-ai-agent-hci-2024/24_02_02.png

## Overview
GoGet은 Usability Test와 User Research(기획자·개발자·디자이너 100명 대상)를 통해 발견한 협업 도구의 자료 검색 문제를 해결하기 위한 AI Agent 기반 대화형 협업 솔루션입니다. 날짜, 팀원, 파일 유형 등 사용자가 기억하는 문맥을 기반으로 필요한 자료를 빠르고 정확하게 찾고, 다음 Task를 제안해 업무 몰입을 지속시킵니다.

## Abstract
대다수의 직장인이 Slack과 같은 협업 도구를 사용하면서 필요한 자료를 찾는 시간이 길어져 업무 몰입이 저하되고 디지털 피로감을 느끼는 문제를 발견했습니다. 기존 도구의 키워드 기반 검색은 사용자가 "맥락"을 기억하는 방식과 불일치하며, 무분별한 알림과 직군별로 다른 탐색 방식도 문제로 지목됩니다.
GoGet은 LLM 기반 Semantic Search 구조를 활용해 Conversational Query → Context Parsing → Result Ranking → Next Task 제안으로 이어지는 Workflow를 설계하여, 사용자의 업무 흐름 단절을 최소화합니다.

## Problem Definition

#### 키워드 중심 검색의 한계
기존 협업 도구는 Keyword Matching 기반 검색을 제공하지만, 사용자는 정확한 키워드보다 "맥락"을 기억하는 경우가 많습니다. 이로 인해 재검색을 반복하게 되고, 업무 흐름이 단절되는 문제가 발생합니다.

#### 무분별한 알림으로 인한 업무 몰입 저하
직무와 무관한 알림이 지속적으로 쌓이면서 중요한 메시지를 놓칠 위험이 생기고, 과도한 Task Switching이 인지 피로(Cognitive Load)를 증가시킵니다.

#### 직군별로 다른 자료 검색 방식
기획자, 개발자, 디자이너는 각각 다른 기준(날짜, 기능, 시각자료 등)으로 정보를 탐색하지만, 기존 도구는 이러한 Mental Model 차이를 충분히 반영하지 못합니다.

## Contribution

#### LLM 기반 Semantic Search 구조 설계
키워드 기반 검색의 한계를 해결하기 위해 LLM을 활용한 Semantic Search 구조를 제안했습니다. 사용자가 기억하는 날짜, 참여자, 파일 유형 등의 문맥 정보를 기반으로 질의를 해석하고 의미 기반으로 결과를 반환하는 Retrieval Flow를 설계했습니다.

#### AI Agent Interaction 시나리오 설계
AI를 단순 검색 기능이 아닌 업무 보조 에이전트(Cognitive Assistant)로 확장하는 인터랙션 시나리오를 설계했습니다. Conversational Query → Context Parsing → Result Ranking → Next Task 제안으로 이어지는 흐름을 정의하여 Workflow 단절을 최소화했습니다.

#### 기술적 실현 가능성 검토
관련 논문과 기술 아티클을 기반으로 LLM, Embedding, Vector DB를 활용한 검색 구조의 적용 가능성을 검토했습니다. B2B SaaS 환경에서의 확장성과 알림 개인화 모델 설계 가능성을 분석하며 개념적 아이디어를 기술적으로 구체화했습니다.
- Vector Search in AI and its Advantages Over Traditional Search (LinkedIn)
- The role of vector databases in generative AI applications (AWS)
- Hybrid Semantic Search: Unveiling User Intent Beyond Keywords (arXiv:2408.09236)


## Solution Design
각 직군의 협업 과정에서 업무에 알맞는 방식으로 자료를 제공해 효율적인 업무 경험을 제공합니다.

- 사용자가 기억하는 문맥(날짜, 팀원, 파일 유형)을 바탕으로 복잡한 필터링 없이 자료 검색
- 업무 패턴에 맞춰 필요한 파일을 자동 제시하고 사용자가 선택해 업무를 진행
- 다음에 해야 할 업무 경로를 제공해 업무 몰입을 유지

## Reflection
이번 프로젝트를 통해 기술 중심이 아닌 HCI 기반 설계의 중요성을 체감할 수 있었습니다. AI를 자동화 도구가 아닌 업무 흐름을 유지시키는 보조 에이전트(Cognitive Assistant)로 바라보는 관점 전환이 이번 설계의 핵심이었습니다.

## Publications
### 생산성 향상을 위한 인공지능 기반 대화형 협업 도구 솔루션 제안
- Authors: Dongwoo Kang, 김민지, 권하은
- Venue: HCI College Conference 2024
- Abstract: AI Agent 기반 Semantic Search와 Conversational Interaction을 활용해 협업 도구에서의 자료 검색 문제를 해결하고 업무 몰입을 높이는 솔루션.
