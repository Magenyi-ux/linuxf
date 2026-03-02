
import { ExamType, Subject, Question } from "../types";

export interface FallbackData {
  [examType: string]: {
    [subject: string]: {
      [year: string]: Question[];
    };
  };
}

export const fallbackData: FallbackData = {
  [ExamType.JAMB]: {
    [Subject.ENGLISH]: {
      "2025": [
        // Paper One
        {
          id: 1,
          text: "The manager gave a succinct explanation of the rules.",
          options: ["Long", "Brief", "Confusing", "Detailed"],
          correctOptionIndex: 1,
          explanation: "'Succinct' means brief and clear; Option B is correct."
        },
        {
          id: 2,
          text: "The scientist’s theory was controversial.",
          options: ["Accepted", "Disputed", "Correct", "Clear"],
          correctOptionIndex: 1,
          explanation: "'Controversial' refers to something disputed or causing disagreement; Option B is correct."
        },
        {
          id: 3,
          text: "She acted with benevolence towards the children.",
          options: ["Cruelty", "Kindness", "Indifference", "Harshness"],
          correctOptionIndex: 1,
          explanation: "'Benevolence' means kindness or goodwill; Option B is correct."
        },
        {
          id: 4,
          text: "His reaction was apathetic.",
          options: ["Indifferent", "Interested", "Energetic", "Caring"],
          correctOptionIndex: 0,
          explanation: "'Apathetic' means indifferent or showing no interest; Option A is correct."
        },
        {
          id: 5,
          text: "The politician was known for his eloquence.",
          options: ["Inarticulateness", "Fluency", "Silence", "Hesitation"],
          correctOptionIndex: 1,
          explanation: "'Eloquence' refers to fluent or persuasive speaking; Option B is correct."
        },
        {
          id: 6,
          text: "Break the ice in the meeting means:",
          options: ["Shatter something frozen", "Initiate conversation", "Cause conflict", "Delay proceedings"],
          correctOptionIndex: 1,
          explanation: "The idiom 'break the ice' means to initiate conversation; Option B is correct."
        },
        {
          id: 7,
          text: "The company’s decision was arbitrary.",
          options: ["Rational", "Random", "Planned", "Justified"],
          correctOptionIndex: 1,
          explanation: "'Arbitrary' means based on random choice rather than reason; Option B is correct."
        },
        {
          id: 8,
          text: "If she ____ harder, she would have passed the exam.",
          options: ["studied", "studies", "had studied", "will study"],
          correctOptionIndex: 2,
          explanation: "This is a third conditional sentence (past unreal); 'had studied' is correct."
        },
        {
          id: 9,
          text: "Neither the teacher nor the students ____ aware of the new schedule.",
          options: ["is", "are", "were", "have"],
          correctOptionIndex: 0,
          explanation: "'Neither...nor' is singular; singular verb 'is' is correct."
        },
        {
          id: 10,
          text: "By the time he arrived, the train ____ already left.",
          options: ["had", "have", "has", "will"],
          correctOptionIndex: 0,
          explanation: "Past perfect is needed for an action completed before another past action; 'had left' is correct."
        },
        {
          id: 11,
          text: "She asked me if I ____ her letter.",
          options: ["received", "had received", "receives", "will receive"],
          correctOptionIndex: 1,
          explanation: "Reported speech for past action uses past perfect; 'had received' is correct."
        },
        {
          id: 12,
          text: "He is better ____ mathematics than his brother.",
          options: ["in", "at", "on", "with"],
          correctOptionIndex: 1,
          explanation: "Correct preposition for skill is 'at'; Option B is correct."
        },
        {
          id: 13,
          text: "The company ____ expanding its operations next year.",
          options: ["is", "are", "were", "be"],
          correctOptionIndex: 0,
          explanation: "'Company' is singular; singular verb 'is' is correct."
        },
        {
          id: 14,
          text: "Transform: She writes a letter → Past tense",
          options: ["She wrote a letter", "She writes a letter", "She is writing a letter", "She had written a letter"],
          correctOptionIndex: 0,
          explanation: "Past tense of 'writes' is 'wrote'; Option A is correct."
        },
        {
          id: 15,
          text: "Each of the students have submitted their assignment.",
          options: ["Each", "of the students", "have", "submitted"],
          correctOptionIndex: 2,
          explanation: "Subject 'Each' is singular; correct verb is 'has'. 'Have' is incorrect."
        },
        {
          id: 16,
          text: "He suggested that she goes to the library to study.",
          options: ["He suggested", "that", "goes", "to the library"],
          correctOptionIndex: 2,
          explanation: "After verbs like 'suggest', base verb is used: 'go' not 'goes'."
        },
        {
          id: 17,
          text: "The teacher asked who ____ completed the project.",
          options: ["has", "have", "had", "having"],
          correctOptionIndex: 1,
          explanation: "Plural implied subject requires 'have'; Option B is correct."
        },
        {
          id: 18,
          text: "Neither of them ____ interested in attending the conference.",
          options: ["is", "are", "were", "have"],
          correctOptionIndex: 0,
          explanation: "'Neither' is singular; singular verb 'is' is correct."
        },
        {
          id: 19,
          text: "He didn’t attend the meeting ____ he was unwell.",
          options: ["because", "although", "unless", "until"],
          correctOptionIndex: 0,
          explanation: "Reason connector is 'because'; Option A is correct."
        },
        {
          id: 20,
          text: "The project was completed on time, ____ all the difficulties encountered.",
          options: ["in spite of", "because of", "due to", "although"],
          correctOptionIndex: 0,
          explanation: "'In spite of' indicates success despite difficulties; Option A is correct."
        },
        // Paper Two
        {
          id: 21,
          text: "According to the passage, education primarily involves developing mind, character, and judgment.",
          options: ["Memorizing facts", "Developing mental and moral abilities", "Learning how to pass exams", "Following instructions blindly"],
          correctOptionIndex: 1,
          explanation: "The passage emphasizes mental and moral development; Option B is correct."
        },
        {
          id: 22,
          text: "A well-educated individual can:",
          options: ["Copy others’ ideas without thought", "Analyze situations critically", "Avoid responsibility", "Focus solely on exams"],
          correctOptionIndex: 1,
          explanation: "The passage states they can analyze situations critically; Option B is correct."
        },
        {
          id: 23,
          text: "The passage implies that society benefits when:",
          options: ["Members avoid education", "Members are educated and responsible", "Only a few are educated", "Education is limited to schools"],
          correctOptionIndex: 1,
          explanation: "Educated and responsible members lead to societal benefit; Option B is correct."
        },
        {
          id: 24,
          text: "The author’s tone can best be described as:",
          options: ["Critical", "Persuasive", "Informative", "Humorous"],
          correctOptionIndex: 2,
          explanation: "Informative tone, providing explanation without persuasion or criticism; Option C is correct."
        },
        {
          id: 25,
          text: "One effect of climate change mentioned in the passage is:",
          options: ["Uniform weather", "Droughts and floods", "Decreased temperatures", "Increased volcanic activity"],
          correctOptionIndex: 1,
          explanation: "Passage mentions droughts and floods; Option B is correct."
        },
        {
          id: 26,
          text: "Which sector is most impacted according to the passage?",
          options: ["Transport", "Agriculture", "Entertainment", "Education"],
          correctOptionIndex: 1,
          explanation: "Agriculture is directly affected by weather changes; Option B is correct."
        },
        {
          id: 27,
          text: "The passage suggests that action should be:",
          options: ["Optional", "Immediate", "Delayed", "Neglected"],
          correctOptionIndex: 1,
          explanation: "Immediate action is stressed; Option B is correct."
        },
        {
          id: 28,
          text: "Mitigate in the passage most nearly means:",
          options: ["Increase", "Reduce", "Ignore", "Understand"],
          correctOptionIndex: 1,
          explanation: "'Mitigate' means reduce or lessen; Option B is correct."
        },
        {
          id: 29,
          text: "The passage primarily discusses:",
          options: ["The dangers of social media", "The impact of technology on human interaction", "How to use digital devices", "Technological inventions"],
          correctOptionIndex: 1,
          explanation: "It discusses technology’s impact on human interaction; Option B is correct."
        },
        {
          id: 30,
          text: "The author suggests that technology:",
          options: ["Should be avoided completely", "Brings both convenience and challenges", "Only has negative effects", "Is irrelevant to society"],
          correctOptionIndex: 1,
          explanation: "Technology brings convenience and challenges; Option B is correct."
        },
        {
          id: 31,
          text: "Reliance in the passage most nearly means:",
          options: ["Dependence", "Resistance", "Innovation", "Connection"],
          correctOptionIndex: 0,
          explanation: "'Reliance' means dependence; Option A is correct."
        },
        {
          id: 32,
          text: "To maintain healthy relationships, one must:",
          options: ["Ignore technology", "Use technology in moderation", "Use only digital communication", "Avoid all conveniences"],
          correctOptionIndex: 1,
          explanation: "Moderation in technology ensures healthy social interactions; Option B is correct."
        },
        {
          id: 33,
          text: "Economic growth alone:",
          options: ["Guarantees social development", "Does not automatically lead to social development", "Reduces inequality", "Improves education only"],
          correctOptionIndex: 1,
          explanation: "Passage says growth does not automatically produce social development; Option B is correct."
        },
        {
          id: 34,
          text: "For sustainable progress, nations should focus on:",
          options: ["Wealth accumulation only", "Reducing inequality", "Ignoring education", "Industrialization alone"],
          correctOptionIndex: 1,
          explanation: "Focus on reducing inequality ensures sustainable development; Option B is correct."
        },
        {
          id: 35,
          text: "The passage implies that healthcare is:",
          options: ["Unnecessary", "A key part of social development", "Only for the wealthy", "Irrelevant"],
          correctOptionIndex: 1,
          explanation: "Healthcare is a key part of social development; Option B is correct."
        },
        {
          id: 36,
          text: "Which word is closest in meaning to prioritized?",
          options: ["Ignored", "Emphasized", "Delayed", "Forgotten"],
          correctOptionIndex: 1,
          explanation: "'Prioritized' means emphasized or given importance; Option B is correct."
        },
        {
          id: 37,
          text: "Reading widely helps in:",
          options: ["Memorizing facts only", "Improving vocabulary and critical thinking", "Avoiding challenges", "Ignoring different ideas"],
          correctOptionIndex: 1,
          explanation: "Passage states it improves vocabulary, comprehension, and critical thinking; Option B is correct."
        },
        {
          id: 38,
          text: "The passage implies that analytical skills are:",
          options: ["Unnecessary", "Developed through regular reading", "Only for adults", "Irrelevant in academics"],
          correctOptionIndex: 1,
          explanation: "Regular reading develops analytical skills; Option B is correct."
        },
        {
          id: 39,
          text: "Exposure to different ideas broadens:",
          options: ["Memory", "Perspective", "Vocabulary only", "Experience of exams"],
          correctOptionIndex: 1,
          explanation: "Exposure broadens perspective; Option B is correct."
        },
        {
          id: 40,
          text: "The author’s main message is:",
          options: ["Reading is unimportant", "Reading develops the mind and skills", "Reading is only for academics", "Reading limits perspective"],
          correctOptionIndex: 1,
          explanation: "Reading develops the mind and analytical skills; Option B is correct."
        },
        // Paper Three
        {
          id: 41,
          text: "The teacher was known for his rigor.",
          options: ["Leniency", "Strictness", "Indifference", "Laziness"],
          correctOptionIndex: 1,
          explanation: "'Rigor' means strictness; Option B is correct."
        },
        {
          id: 42,
          text: "The athlete showed resilience in overcoming challenges.",
          options: ["Fragility", "Endurance", "Weakness", "Fatigue"],
          correctOptionIndex: 1,
          explanation: "'Resilience' means endurance or ability to recover; Option B is correct."
        },
        {
          id: 43,
          text: "Her argument was spurious.",
          options: ["Genuine", "False", "Logical", "Valid"],
          correctOptionIndex: 1,
          explanation: "'Spurious' means false or not genuine; Option B is correct."
        },
        {
          id: 44,
          text: "Hit the sack means:",
          options: ["Go to sleep", "Fight someone", "Work hard", "Buy food"],
          correctOptionIndex: 0,
          explanation: "Idiom meaning 'go to sleep'; Option A is correct."
        },
        {
          id: 45,
          text: "The medicine was efficacious in treating the disease.",
          options: ["Ineffective", "Effective", "Dangerous", "Useless"],
          correctOptionIndex: 1,
          explanation: "'Efficacious' means effective; Option B is correct."
        },
        {
          id: 46,
          text: "The manager’s decision was capricious.",
          options: ["Predictable", "Arbitrary", "Thoughtful", "Rational"],
          correctOptionIndex: 1,
          explanation: "'Capricious' means unpredictable or arbitrary; Option B is correct."
        },
        {
          id: 47,
          text: "If I ____ enough money, I would buy a new laptop.",
          options: ["have", "had", "will have", "had had"],
          correctOptionIndex: 1,
          explanation: "Second conditional for present/future unreal situation; 'had' is correct."
        },
        {
          id: 48,
          text: "Neither the students nor the teacher ____ present.",
          options: ["is", "are", "were", "have"],
          correctOptionIndex: 0,
          explanation: "'Neither...nor' is singular; 'is' is correct."
        },
        {
          id: 49,
          text: "She asked me if I ____ the package.",
          options: ["received", "have received", "had received", "receives"],
          correctOptionIndex: 2,
          explanation: "Reported speech requires past perfect; 'had received' is correct."
        },
        {
          id: 50,
          text: "He has been ____ to improve his skills for the past month.",
          options: ["working", "works", "work", "worked"],
          correctOptionIndex: 0,
          explanation: "Present perfect continuous requires 'working'; Option A is correct."
        },
        {
          id: 51,
          text: "Transform: She sings beautifully → Past tense",
          options: ["She sang beautifully", "She sung beautifully", "She sing beautifully", "She had sung beautifully"],
          correctOptionIndex: 0,
          explanation: "Past tense of 'sings' is 'sang'; Option A is correct."
        },
        {
          id: 52,
          text: "The students were told to submit their essays ____ Friday.",
          options: ["at", "on", "in", "by"],
          correctOptionIndex: 3,
          explanation: "Deadline indicated by 'by'; Option D is correct."
        },
        {
          id: 53,
          text: "Each of the players have done their best.",
          options: ["Each", "of the players", "have", "done"],
          correctOptionIndex: 2,
          explanation: "Subject 'Each' is singular; correct verb is 'has'."
        },
        {
          id: 54,
          text: "He recommended that she takes the earlier flight.",
          options: ["recommended", "that", "takes", "earlier"],
          correctOptionIndex: 2,
          explanation: "After 'recommended', base verb 'take' is correct; 'takes' is wrong."
        },
        {
          id: 55,
          text: "Neither of them ____ prepared for the test.",
          options: ["is", "are", "were", "have"],
          correctOptionIndex: 0,
          explanation: "'Neither' is singular; singular verb 'is' is correct."
        },
        {
          id: 56,
          text: "I wish I ____ more time to finish my project.",
          options: ["have", "had", "will have", "has"],
          correctOptionIndex: 1,
          explanation: "Second conditional for past unreal desire; 'had' is correct."
        },
        {
          id: 57,
          text: "He couldn’t attend the party ____ he was unwell.",
          options: ["although", "because", "unless", "until"],
          correctOptionIndex: 1,
          explanation: "Reason connector is 'because'; Option B is correct."
        },
        {
          id: 58,
          text: "She was praised for her performance, ____ the challenges she faced.",
          options: ["in spite of", "because of", "due to", "although"],
          correctOptionIndex: 0,
          explanation: "'In spite of' shows success despite difficulties; Option A is correct."
        },
        {
          id: 59,
          text: "The team will start the project ____ the budget is approved.",
          options: ["unless", "until", "when", "although"],
          correctOptionIndex: 2,
          explanation: "Time connector 'when' is correct; Option C is correct."
        },
        {
          id: 60,
          text: "He acted ____ he was unaware of the consequences.",
          options: ["as though", "although", "because", "unless"],
          correctOptionIndex: 0,
          explanation: "'As though' expresses manner or appearance; Option A is correct."
        }
      ]
    }
  },
  [ExamType.WAEC]: {
    [Subject.ENGLISH]: {
      "2025": [] // Will be populated by the same data in geminiService
    }
  },
  [ExamType.NECO]: {
    [Subject.ENGLISH]: {
      "2025": [] // Will be populated by the same data in geminiService
    }
  }
};

// Mirroring the data for all exam types
fallbackData[ExamType.WAEC][Subject.ENGLISH]["2025"] = fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"];
fallbackData[ExamType.NECO][Subject.ENGLISH]["2025"] = fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"];
