---
title: "Toy projects for my birthday"
author: "Dongwoo Kang"
affiliation: "Dongwoo Kang"
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

## When Food Falls from the Sky (2026)
#### Background
I initially built the game in vanilla JavaScript without a framework. I wanted to implement it myself using everything I had learned in my web programming course.

#### Core implementation
The most important component was the weighted selection mechanism that determines how often each falling item appears.
It selects an item by sequentially subtracting item weights from a random value and returning an item once the value reaches zero or below. Tuning the distribution required many revisions and tests.
- Weighted random item selection
- A requestAnimationFrame-based game loop
- Collision detection
- Scheduled special item appearances
- Deployment to GitHub Pages

#### Improvements with an LLM (2026)
Three years later, I revisited the project and improved it with Claude.
First, I rebuilt the overall design system. The original game used images from the internet with inconsistent styles. Generating characters and interface elements with an LLM helped create a more consistent design. I also integrated Firebase to share the game with people and add a leaderboard, using the LLM and related tools for this work as well.
- Rebuilt the design system
- Refactored the game code: audio management, object cleanup, and separation into functions
- Integrated Firebase

## Dadogyeol (2023)

#### Overview
> An iOS tea ceremony guide that brings traditional tea culture into everyday life
The app guides users through a tea ceremony step by step, helping busy people pause and find a moment of calm. It was designed to make tea ceremonies approachable even for people unfamiliar with tea.

- Platform: iOS 16+
- Development period: 2023
- Technology: SwiftUI

#### Interactive Step Indicator
Long-pressing the dot indicator at the top expands it to show the names of each step. Users can then slide directly to the desired step.
Different haptic intensities at the start of a long press, when changing selection, and on release provide natural physical feedback.

#### A subpage ScrollView that would not scroll
- Background
In UnsureFlowView, adding contentShape(Rectangle()) to Color.clear.frame(maxWidth: .infinity) to register a back-swipe gesture made the entire screen a gesture hit area. It intercepted touches intended for the ScrollView in TeaInfoView / DadoInfoView layered above it.

- Solution
I restricted the gesture hit area to a 30-point strip on the left edge of the screen. With the pattern HStack { Color.clear.frame(width: 30).contentShape(Rectangle()).gesture(...); Spacer() }, the Spacer passes touches in the remaining area through, allowing the ScrollView to work normally.

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

#### Duplicate timer logic
- Background
The steeping steps for traditional tea and tea bags each had their own timer view. Aside from the title strings and preset lists, they shared the same layout, TimerState binding, countdown ring, and MagneticSlider logic. A change to one therefore had to be repeated in the other.

- Solution
I consolidated them into a single MagneticTimerView that receives title, subtitle, waitingText, and presets as parameters. Both views now call the same component with different parameters, keeping one source of truth for the code.
