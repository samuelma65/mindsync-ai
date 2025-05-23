# mindsync-ai
## **Key Features & Flow**

### **1. User Onboarding & Vocabulary Selection**

- On first use, the user selects a default vocabulary set categorized by three difficulty levels: **Easy**, **Medium**, or **Hard**.
- These vocabularies are pre-populated in the database (Supabase) and linked to the user’s profile.
- The user’s vocabulary profile will expand as they encounter new words.

### **2. Document Upload & Extraction**

- The user uploads a document (PDF or TXT).
- The app extracts the full text content from the document.

### **3. Unfamiliar Word Highlighting & Explanation**

- The app scans the document and compares all words to the user’s known vocabulary (from Supabase).
- **All unfamiliar words** (not in the user’s vocabulary, or not mastered) are **highlighted** in the document preview.
- For each highlighted word, the app provides:
- A brief explanation/definition (from the vocabulary table or via GPT-4/OpenAI API)
- Optionally, an example sentence
- The user can review these words and mark any as “I know this” (which adds them to their known vocabulary).
- New unfamiliar words are added to the user’s vocabulary profile in Supabase, and the vocabulary database grows as the user studies more documents.

### **4. AI-Powered Summarization & Quiz Generation**

- GPT-4 summarizes the document in 2–3 bullet points.
- GPT-4 identifies important vocabulary words based on the content.
- GPT-4 generates 5 multiple-choice quiz questions based on the document, prioritizing:
- Words that are new to the user
- Words recently answered incorrectly
- Words with a low strength_score
- Each question has options A–D and a clearly marked correct answer.

### **5. Adaptive Quiz Flow**

- The quiz is presented one question at a time.
- The user answers each question and receives instant feedback:
- “✅ Correct!” or “❌ Incorrect. Here’s the correct answer and why.”
- After 5 questions, a “🎉 You’ve finished!” message is shown.
- The user’s vocabulary stats are updated in Supabase:
- If a word is answered correctly 3 times in a row, its difficulty is upgraded or it is marked as “mastered.”
- If answered incorrectly, its strength_score is lowered.
- Stats tracked: times_seen, last_answer_correct, strength_score, correct_streak, etc.

### **6. Vocabulary Stats & Progress**

- A sidebar or popup displays the user’s current vocabulary stats and progress.
- Progress is visualized as “Leveling up” vocabulary or “Building knowledge bricks.”
- Users can reset or export their vocabulary stats.

### **7. Voice Chat Feature (Whisper API)**

- After the quiz, the user is prompted: “Would you like to ask any questions about this document? You can type or use your voice.”
- The user can:
- **Type a question** in the chat interface
- **Record a voice question** (using a microphone button)
- The app records the audio and sends it to the backend
- The backend uses the **OpenAI Whisper API** to transcribe the audio to text
- The transcribed question is sent to GPT-4 for an answer based on the document content
- The answer is displayed in the chat interface (and can optionally be read aloud using browser TTS).

---

## **Tech Stack**

- **Frontend:** React, Tailwind CSS, React Query, Zustand/Redux (optional), Web Speech API (for TTS), MediaRecorder API (for audio recording)
- **Backend:** Node.js (Express), OpenAI API (GPT-4 for text, Whisper for speech-to-text), Supabase (Postgres) for user/vocab data, Multer/pdf-parse for file handling
- **Database:** Supabase (Postgres, managed, with RESTful and real-time API)

---

## **Database Schema (Supabase)**

**users**

- id (uuid, PK)
- username (string)
- created_at (timestamp)

**vocabulary**

- id (uuid, PK)
- word (string)
- difficulty_level (enum: easy, medium, hard)
- definition (string)
- example (string)

**user_vocab**

- id (uuid, PK)
- user_id (uuid, FK to users)
- vocab_id (uuid, FK to vocabulary)
- times_seen (int)
- last_answer_correct (bool)
- strength_score (float, 0–1)
- correct_streak (int)
- added_at (timestamp)
