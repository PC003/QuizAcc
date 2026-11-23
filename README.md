# QuizMaster Pro - Comprehensive CAT 1, CAT 2 & CAT 3 Quiz Platform

A high-performance, modern, client-side web application containing **all 700 verified multiple-choice questions** across CAT 1, CAT 2, and CAT 3 syllabi.

---

## 🚀 Quick Start

You can open and run this platform directly in any web browser:

### Option 1: Direct File
Double click or open [`index.html`](./index.html) in any browser (Chrome, Safari, Edge, Firefox).

### Option 2: Local HTTP Server (Already active on port 8088)
```bash
python3 -m http.server 8088
```
Then visit: **[http://localhost:8088](http://localhost:8088)**

---

## 📚 Curriculum & Question Breakdown (700 Total MCQs)

### 🔹 CAT 1 (260 Questions)
1. **Java Introduction, Features, Structure, Data Types** (20 Qs)
2. **Basic I/O, Operators** (20 Qs)
3. **Decision making and Control structures** (20 Qs)
4. **Introduction to Algorithms** (20 Qs)
5. **Time & Space complexity-1.1** (20 Qs)
6. **Time & Space complexity-1.2** (20 Qs)
7. **Simple Sieve (Sieve of Eratosthenes)** (20 Qs)
8. **Segmented & Incremental Sieve** (20 Qs)
9. **Euler's Totient (phi) Algorithm** (20 Qs)
10. **Strobogrammatic Numbers** (20 Qs)
11. **Chinese Remainder Theorem** (20 Qs)
12. **Toggle the Switch & Alice Apple Tree** (20 Qs)
13. **Binary Palindrome** (20 Qs)

### 🔹 CAT 2 (180 Questions)
1. **Booth's Algorithm** (15 Qs)
2. **Euclid's Algorithm & Extended Euclidean** (15 Qs)
3. **Karatsuba Multiplication Algorithm** (15 Qs)
4. **Longest Sequence of 1s After Flipping a Bit** (15 Qs)
5. **Swap Two Nibbles in a Byte** (15 Qs)
6. **Block Swap Algorithm** (15 Qs)
7. **Maximum Product Subarray** (15 Qs)
8. **Maximum Sum of Hourglass in a Matrix** (15 Qs)
9. **Max Equilibrium Sum (Pivot Index)** (15 Qs)
10. **Leaders in an Array** (15 Qs)
11. **Majority Element (Boyer–Moore Voting)** (15 Qs)
12. **Lexicographically First Palindromic String** (15 Qs)

### 🔹 CAT 3 (260 Questions)
1. **Natural Sort (Alphanumeric String Sorting)** (20 Qs)
2. **Quick & Selection Sort** (20 Qs)
3. **Weighted Substring (Trie & Prefix Weights)** (20 Qs)
4. **Move Hyphen (In-Place & Linear Traversal)** (20 Qs)
5. **Manacher's Algorithm (Linear Palindromes)** (20 Qs)
6. **Sorted Unique Permutation (Backtracking & Duplicates)** (20 Qs)
7. **Maneuvering (Grid Shortest Paths & DP)** (20 Qs)
8. **Combinations (nCr Identities & Selections)** (20 Qs)
9. **Josephus Trap (Cyclic Elimination Recurrence)** (20 Qs)
10. **Maze Solving (DFS Backtracking & BFS Shortest Path)** (20 Qs)
11. **N-Queens Problem (Backtracking & Bitmask Checks)** (20 Qs)
12. **Warnsdorff’s Algorithm (Knight's Tour Heuristic)** (20 Qs)
13. **Hamiltonian Cycle & Path** (20 Qs)

---

## ✨ Features

- **Memory & Study Mode (Always Show Answers)**:
  - Toggle **`🧠 Memory Mode: ON/OFF`** in the sub-bar (or press <kbd>M</kbd>) to automatically display the correct answer and detailed explanation for every question as you navigate through them — ideal for rapid memorization and exam revision!
- **On-Demand "Show Answer" Button**:
  - Each question card features an eye icon **`Show Answer`** button (or press <kbd>S</kbd>) that reveals the correct option badge and explanation card on demand while solving.
- **Instant Visual Feedback**: Options turn green with a checkmark upon correct answers, or red upon wrong answers while highlighting the true answer.
- **Detailed Explanations**: Immediately reveals the reasoning, underlying formulas, and algorithmic logic after answering each question.
- **Restart Quiz Anytime**:
  - Top navigation bar **Restart** button resets the active category.
  - Palette bottom **Restart All Progress** button resets all questions.
  - Confirmation modals prevent accidental resets.
- **Question Palette Matrix**:
  - 1-to-N interactive palette with live color coding (Green = Correct, Red = Wrong, Blue = Current, Gray = Unanswered).
  - One-click jump to any question in the section.
- **Filter & Search System**:
  - Filter by Topic dropdown.
  - Filter by status: *All*, *Unanswered*, *Mistakes* (Review mode), and *Saved* (Bookmarks).
  - Live instantaneous keyword search across questions and options.
- **Audio Feedback**: Built-in pleasant synthesizer tones (via Web Audio API) with a 1-click sound toggle.
- **Dark / Light Mode**: Seamless theme switcher that remembers your preference in `localStorage`.
- **Keyboard Shortcuts**:
  - `A`, `B`, `C`, `D` or `1`, `2`, `3`, `4`: Select option.
  - `→` / `Enter`: Next question.
  - `←`: Previous question.
  - `Shuffle`: Randomize questions in view.

---

## 📁 File Structure

```
QuizAcc/
├── index.html           # Main semantic HTML5 platform interface
├── styles.css           # Modern glassmorphism & responsive CSS design
├── app.js               # Application controller & state machine
├── questions.js         # Complete verified dataset of 700 questions (JS export)
├── questions.json       # Pure JSON dataset format for APIs / external use
└── README.md            # Documentation & syllabus guide
```

