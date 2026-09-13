---
title: "An AI Agent-Based Conversational Collaboration Solution"
author: "Minji Kim, Dongwoo Kang, Ha-Eun Kwon"
affiliation: CIT HCI College
venue: "HCI College Conference 2024"
Links:
- Paper: https://www.companoid.institute/achievement-project/goget
- News: https://platum.kr/archives/247782
---

# An AI-Powered Conversational Collaboration Solution for Better Productivity

## Show
assets/images/collab-ai-agent-hci-2024/24_02_00.png
assets/images/collab-ai-agent-hci-2024/24_02_01.png
assets/images/collab-ai-agent-hci-2024/24_02_02.png
assets/images/collab-ai-agent-hci-2024/24_02_03.png
assets/images/collab-ai-agent-hci-2024/24_02_04.png
assets/images/collab-ai-agent-hci-2024/24_02_05.png
assets/images/collab-ai-agent-hci-2024/24_02_06.png

## Overview
GoGet is an AI agent-based conversational collaboration solution that addresses information retrieval problems identified through usability testing and user research with 100 planners, developers, and designers. It helps users find materials quickly and accurately using the context they remember, such as dates, teammates, or file types, then suggests the next task to help them stay focused.

## Abstract
We found that many office workers spend too much time searching for materials in collaboration tools such as Slack, disrupting their concentration and contributing to digital fatigue. Existing keyword-based search does not match the way people remember context. Excessive notifications and differences in how professional roles search for information create additional problems.
GoGet uses LLM-based semantic search in a workflow of conversational query → context parsing → result ranking → next-task suggestion, minimizing interruptions to the user's work.

## Problem Definition

#### Limitations of keyword-based search
Existing collaboration tools use keyword matching, but users often remember the context rather than exact keywords. As a result, they repeatedly search for the same materials, interrupting their workflow.

#### Loss of focus caused by excessive notifications
Notifications unrelated to a person's role accumulate, increasing the risk of missing important messages. Excessive task switching also increases cognitive load.

#### Different search strategies across professional roles
Planners, developers, and designers use different criteria to find information, such as dates, features, or visual references. Existing tools do not sufficiently account for these differences in mental models.

## Contribution

#### Designing an LLM-based semantic search architecture
To address the limitations of keyword search, I proposed a semantic search architecture using an LLM. I designed a retrieval flow that interprets queries using contextual details users remember, including dates, participants, and file types, and returns results based on meaning.

#### Designing AI agent interaction scenarios
I designed interaction scenarios that extend AI from a search feature into a cognitive assistant. The flow—conversational query → context parsing → result ranking → next-task suggestion—was defined to minimize breaks in the user's workflow.

#### Assessing technical feasibility
I reviewed research papers and technical articles to assess the feasibility of retrieval using LLMs, embeddings, and vector databases. By analyzing scalability in B2B SaaS environments and the potential for personalized notifications, I developed the concept into a more concrete technical proposal.
- Vector Search in AI and its Advantages Over Traditional Search (LinkedIn)
- The role of vector databases in generative AI applications (AWS)
- Hybrid Semantic Search: Unveiling User Intent Beyond Keywords (arXiv:2408.09236)

## Solution Design
The solution supports more efficient collaboration by delivering materials in ways that suit each professional role and task.

- Search for materials using remembered context—dates, teammates, and file types—without complex filtering.
- Automatically suggest relevant files based on work patterns so users can select one and continue working.
- Offer a path to the next task to help users remain focused.

## Reflection
This project taught me the importance of HCI-led design over a purely technology-led approach. The central shift was to view AI as a cognitive assistant that preserves the user's workflow, rather than simply as an automation tool.
