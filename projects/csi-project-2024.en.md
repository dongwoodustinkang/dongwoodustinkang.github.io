---
title: "CSI Denoising and Preprocessing Optimization to Overcome Hardware Noise"
author: "Content Convergence Research Center"
affiliation: Korea Electronics Technology Institute(KETI)
venue: "2024 Korea Electronics Technology Institute(KETI)"
Links:
- Paper: https://ieeexplore.ieee.org/document/10827644
---

## Show
assets/images/csi-project-2024/csi24-01.png
assets/images/csi-project-2024/csi24-02.png
assets/images/csi-project-2024/csi24-03.png
assets/images/csi-project-2024/csi24-04.png
assets/images/csi-project-2024/csi24-05.png
assets/images/csi-project-2024/csi24-06.png

## Overview
This project aimed to develop a contactless AI sensing system that recognizes indoor human activities using commercial Wi-Fi chipsets, without cameras or wearables. I joined in May 2024 and worked to resolve an issue in which noisy channel state information (CSI) from hardware receivers prevented effective AI model training. I focused on **data cleaning and pipeline design on the software side**. This substantially reduced false detections and improved activity detection accuracy. The data cleaning techniques developed during this work led to a first-author paper that I wrote and presented at an international academic conference in 2024.

## Problem Definition

#### Spiking noise
Sudden noise spikes appeared when raw complex-valued data was converted to amplitude. Abnormal values also entered null subcarrier regions that should have been empty under the communication specification, causing inconsistent data dimensions.

#### Static interference from furniture and walls, and signal drift during extended operation
When collecting indoor Wi-Fi signals, strong reflections from static objects such as furniture and walls made it difficult to detect human activity patterns. During extended operation, we also observed **signal drift** associated with changes in indoor temperature and humidity or automatic channel changes. The AI model consequently learned changes in the background rather than human activity. Recognition accuracy declined over time, and the collected raw data lost consistency.

## Solution Process

#### Noise correction through exception handling and Butterworth filtering
I proactively removed null subcarrier indices affected by unstable communication to reduce unnecessary neural network computation. To remove spiking noise, I then introduced a Butterworth low-pass filter with a flat frequency response. I implemented the filtering logic to remove high-frequency noise while minimizing temporal distortion of the signal.

#### Separating static environmental components using singular value decomposition
Training and inference on the collected dataset revealed a problem with the collection environment.
I addressed background signal interference through mathematical decomposition. First, I collected CSI data in an empty room and **applied singular value decomposition (SVD)** to the data matrix. After identifying the dominant singular-value components associated with fixed furniture and walls, I subtracted these components from incoming data in real time. This allowed the AI model to focus on changes caused by human movement without interference from unnecessary background noise.

## Contribution

#### A preprocessing pipeline for more effective AI training
Integrating the preprocessing pipeline I designed improved the signal-to-noise ratio of raw CSI signals by more than 15 dB on average.
This high-quality, cleaned data improved downstream AI model performance, achieving activity detection accuracy of 77% under the quantitative evaluation criteria with just one low-cost receiver.

#### Research outcomes in 2024
Beyond solving practical project problems, I wanted to **demonstrate the research value of my CSI preprocessing techniques and the additional sequence time alignment method I devised**. When collecting camera imagery based on YOLOv8-pose and Wi-Fi CSI in parallel for indoor activity recognition, differences in sampling rates caused temporal misalignment. I built a synchronization pipeline using Python multiprocessing and applied linear interpolation to align timestamps precisely at 0.1-second intervals. Applying this cleaned, synchronized data to a Bi-LSTM model achieved activity recognition accuracy of 86.87%, supporting the validity of the algorithm.

I documented the data cleaning and multimodal collection pipeline in a first-author paper, ["A Study on Fusion Acquisition of Image and CSI Data for Posture Estimation in Indoor Environments"](https://ieeexplore.ieee.org/document/10827644), and presented it at the IEEE ICTC 2024 international conference in October 2024.

```cite
D. Kang et al. "A Study on Fusion Acquisition of Image and CSI Data for Posture Estimation in Indoor Environments," 2024 15th International Conference on Information and Communication Technology Convergence (ICTC), Jeju Island, Korea, Republic of, 2024, pp. 1312-1314, doi: 10.1109/ICTC62082.2024.10827644.
```

#### Reflection
This experience strengthened my ability as a researcher to analyze problems from multiple perspectives and draw on mathematics and engineering to find solutions.
