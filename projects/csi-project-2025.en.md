---
title: "Advanced Data Preprocessing and a CSI-Based On-Device AIoT System"
author: "Content Convergence Research Center"
affiliation: Korea Electronics Technology Institute(KETI)
venue: "2025 Korea Electronics Technology Institute(KETI)"
Links:
- Paper: https://ieeexplore.ieee.org/document/11263593
- DEMO: https://youtu.be/35QwhL_oh_Q
- Github: https://github.com/thkimKETI/csi-sensing
---

## Show
assets/images/csi-project-2025/csi25-00.png
assets/images/csi-project-2025/csi25-01.png
assets/images/csi-project-2025/csi25-02.png
assets/images/csi-project-2025/csi25-03.png
assets/images/csi-project-2025/csi25-04.png
assets/images/csi-project-2025/csi25-05.png

## Overview
In the third year of the project, we expanded the system to support multiple receivers and edge computing. We designed and built synchronized multi-stream data collection using sequence time alignment, with AI inference running on Android and Linux. We also successfully ported lightweight AI models, including TinyCNN, SVM, and attention-based models, to edge devices. The system achieved officially certified activity detection accuracy above 96% in TTA testing, demonstrating how software improvements can overcome hardware limitations.

## Media
<iframe width="560" height="315" src="https://www.youtube.com/embed/35QwhL_oh_Q?si=BLU99dcGeCglYry6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Problem Definition

#### Timestamp misalignment when scaling to multiple receivers
The limited transmission and reception coverage of a single ESP32-S3 receiver created **dead zones**. To address this and improve spatial diversity, we expanded the system to connect up to four receivers. However, differences in packet processing and communication latency caused data to arrive at the server at different times. Training on these unsynchronized fused inputs led to a sharp decline in classification accuracy.

#### Severe compute and memory constraints on mobile edge devices
Compared with high-performance servers, mobile edge devices such as smartphones, tablets, and home hubs have **very limited processing power and memory**. Heavy, complex time-series models such as the Transformer explored early in the research could introduce unacceptable inference latency at the edge. The increased dimensionality of inputs from multiple sensors also made overfitting more severe.

## Solution Process

#### A TimeLocked sequence alignment algorithm
I devised a **sequence time alignment method** combining a TimeLocked process, which compares device timestamps and waits for the latest arrival, with linear interpolation to fill gaps caused by delays. This uniformly aligned nine packets per 0.1-second interval and produced synchronized, two-second blocks of fused CSI data. The method substantially improved recognition accuracy in the multi-receiver setup. I presented this work as a first-author paper at an international conference.

#### A Linux MQTT streaming pipeline and a full-stack Android implementation
Relying entirely on a cloud server could introduce network latency and privacy concerns, so I designed an end-to-end architecture that runs on a local network. I built a **data collection pipeline that streams topics in real time using MQTT**, a lightweight IoT protocol. To prevent data bottlenecks, I refactored the existing system into modules and separated them into independent processes, creating a **parallel architecture**. I then ported the preprocessing and inference logic to **Android**, enabling real-time data collection and processing on a mobile device without an internet connection.

#### Lightweight TinyCNN design and automated TF Lite deployment
I designed TinyCNN and SVM classifiers suited to edge environments. After reducing tens of thousands of parameters, I trained the models in PyTorch and **converted them through ONNX into formats suitable for edge deployment**. These lighter models were successfully integrated into the Android app, enabling real-time parallel inference using only the Android CPU.

| | Activity detection | Occupancy count | Location |
| - | - | - | - |
| 2 receivers | 95.52% | 89.64% | 99.5% |
| 4 receivers | 97.78% | 96.67% | 99.62% |

## Contribution

#### An ICCE-Asia 2025 poster on overcoming hardware limitations through time alignment
Resolving timestamp misalignment and packet arrival issues across four receivers through software architecture and time alignment had research value beyond fixing an implementation problem. I quantified how much the synchronization algorithm I designed improved AI recognition performance and developed these findings into a first-author research contribution.
The research was presented as a poster at IEEE/IEIE ICCE-Asia 2025 under the title ["Robust Wifi Channel State Information-based Localization via Sequence Time Alignment"](https://ieeexplore.ieee.org/document/11263593).

```
D. Kang, et al., "Robust WiFi Channel State Information-Based Localization via Sequence Time Alignment," 2025 IEEE/IEIE International Conference on Consumer Electronics-Asia (ICCE-Asia), Busan, Korea, Republic of, 2025, pp. 1-3, doi: 10.1109/ICCE-Asia67487.2025.11263593.
```
