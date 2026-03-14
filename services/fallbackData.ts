
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
        { id: 1, text: "The manager gave a succinct explanation of the rules.", options: ["Long", "Brief", "Confusing", "Detailed"], correctOptionIndex: 1, explanation: "'Succinct' means brief and clear; Option B is correct. Simplified Method: Remember 'succinct' sounds like 'short'." },
        { id: 2, text: "The scientist’s theory was controversial.", options: ["Accepted", "Disputed", "Correct", "Clear"], correctOptionIndex: 1, explanation: "'Controversial' refers to something disputed; Option B is correct. Simplified Method: Think of 'controversy' as a public argument." },
        { id: 3, text: "She acted with benevolence towards the children.", options: ["Cruelty", "Kindness", "Indifference", "Harshness"], correctOptionIndex: 1, explanation: "'Benevolence' means kindness; Option B is correct. Simplified Method: 'Ben' means good, like in 'benefit'." },
        { id: 4, text: "His reaction was apathetic.", options: ["Indifferent", "Interested", "Energetic", "Caring"], correctOptionIndex: 0, explanation: "'Apathetic' means indifferent; Option A is correct. Simplified Method: 'Pathos' is feeling, 'a-' is without." },
        { id: 5, text: "The politician was known for his eloquence.", options: ["Inarticulateness", "Fluency", "Silence", "Hesitation"], correctOptionIndex: 1, explanation: "'Eloquence' refers to fluent speaking; Option B is correct. Simplified Method: Think of 'elegant' speech." },
        { id: 6, text: "Break the ice in the meeting means:", options: ["Shatter something frozen", "Initiate conversation", "Cause conflict", "Delay proceedings"], correctOptionIndex: 1, explanation: "The idiom 'break the ice' means to initiate conversation; Option B is correct. Simplified Method: Getting rid of the 'cold' silence." },
        { id: 7, text: "The company’s decision was arbitrary.", options: ["Rational", "Random", "Planned", "Justified"], correctOptionIndex: 1, explanation: "'Arbitrary' means based on random choice; Option B is correct. Simplified Method: No clear logic or reason." },
        { id: 8, text: "If she ____ harder, she would have passed the exam.", options: ["studied", "studies", "had studied", "will study"], correctOptionIndex: 2, explanation: "Third conditional uses 'had studied'; Option C is correct. Simplified Method: 'Would have' needs 'had' in the 'if' clause." },
        { id: 9, text: "Neither the teacher nor the students ____ aware of the new schedule.", options: ["is", "are", "were", "have"], correctOptionIndex: 0, explanation: "'Neither...nor' follows the nearest subject or singular rule in standard JAMB grammar; 'is' is often preferred. Simplified Method: Treat the pair as one unit." },
        { id: 10, text: "By the time he arrived, the train ____ already left.", options: ["had", "have", "has", "will"], correctOptionIndex: 0, explanation: "Past action before another past action needs past perfect; Option A is correct. Simplified Method: Use 'had' for the earlier event." },
        { id: 11, text: "She asked me if I ____ her letter.", options: ["received", "had received", "receives", "will receive"], correctOptionIndex: 1, explanation: "Reported speech for past action uses past perfect; Option B is correct. Simplified Method: Shift tense back from past to past perfect." },
        { id: 12, text: "He is better ____ mathematics than his brother.", options: ["in", "at", "on", "with"], correctOptionIndex: 1, explanation: "Correct preposition for skill is 'at'; Option B is correct. Simplified Method: You are good 'at' things." },
        { id: 13, text: "The company ____ expanding its operations next year.", options: ["is", "are", "were", "be"], correctOptionIndex: 0, explanation: "Collective noun 'company' is singular; Option A is correct. Simplified Method: It acts as one body." },
        { id: 14, text: "Transform: She writes a letter → Past tense", options: ["She wrote a letter", "She writes a letter", "She is writing a letter", "She had written a letter"], correctOptionIndex: 0, explanation: "Past tense of 'writes' is 'wrote'; Option A is correct. Simplified Method: Simple past for a completed action." },
        { id: 15, text: "Each of the students have submitted their assignment.", options: ["Each", "of the students", "have", "submitted"], correctOptionIndex: 2, explanation: "Subject 'Each' is singular; correct verb is 'has'. Simplified Method: 'Each' always takes a singular verb." },
        { id: 16, text: "He suggested that she goes to the library to study.", options: ["He suggested", "that", "goes", "to the library"], correctOptionIndex: 2, explanation: "Subjunctive mood uses base verb 'go'; Option C is correct. Simplified Method: Drop the '-s' after suggest/insist." },
        { id: 17, text: "The teacher asked who ____ completed the project.", options: ["has", "have", "had", "having"], correctOptionIndex: 2, explanation: "Reported question about completed action uses 'had'; Option C is correct. Simplified Method: Past perfect for earlier completion." },
        { id: 18, text: "Neither of them ____ interested in attending the conference.", options: ["is", "are", "were", "have"], correctOptionIndex: 0, explanation: "'Neither' is singular; Option A is correct. Simplified Method: 'Neither' = Not one (singular)." },
        { id: 19, text: "He didn’t attend the meeting ____ he was unwell.", options: ["because", "although", "unless", "until"], correctOptionIndex: 0, explanation: "Reason connector is 'because'; Option A is correct. Simplified Method: Shows the 'why'." },
        { id: 20, text: "The project was completed on time, ____ all the difficulties encountered.", options: ["in spite of", "because of", "due to", "although"], correctOptionIndex: 0, explanation: "'In spite of' indicates success despite difficulties; Option A is correct. Simplified Method: Success vs Difficulty." },
        // ... (Adding more English and Mathematics for 2025 to meet 60 requirement)
        { id: 21, text: "The synonym of 'Abundant' is:", options: ["Scarce", "Plentiful", "Rare", "Lacking"], correctOptionIndex: 1, explanation: "Abundant means more than enough. Simplified Method: Think 'A bundle' of things." },
        { id: 22, text: "Choose the correct spelling:", options: ["Accomodation", "Accommodation", "Acomodation", "Accommadation"], correctOptionIndex: 1, explanation: "Accommodation has double 'c' and double 'm'. Simplified Method: Two cars, two mountains." },
        { id: 23, text: "He is the ____ of the two brothers.", options: ["tallest", "taller", "tall", "most tall"], correctOptionIndex: 1, explanation: "Comparison between two uses '-er'. Simplified Method: Use -er for 2, -est for 3+." },
        { id: 24, text: "The police ____ searching for the thief.", options: ["is", "are", "was", "has"], correctOptionIndex: 1, explanation: "'Police' is a plural noun. Simplified Method: Police = many officers." },
        { id: 25, text: "She has been here ____ morning.", options: ["for", "since", "from", "at"], correctOptionIndex: 1, explanation: "'Since' is used for a point in time. Simplified Method: Since [Start Time]." },
        { id: 26, text: "The boy ____ bag was stolen is crying.", options: ["who", "whom", "whose", "which"], correctOptionIndex: 2, explanation: "Possessive relative pronoun is 'whose'. Simplified Method: Whose [Noun]." },
        { id: 27, text: "I look forward to ____ you.", options: ["see", "seeing", "seen", "saw"], correctOptionIndex: 1, explanation: "'Look forward to' is followed by a gerund. Simplified Method: To + -ing here." },
        { id: 28, text: "He is afraid ____ dogs.", options: ["of", "off", "with", "at"], correctOptionIndex: 0, explanation: "Afraid takes the preposition 'of'. Simplified Method: Afraid OF." },
        { id: 29, text: "He has a large ____ of money.", options: ["amount", "number", "quantity", "total"], correctOptionIndex: 0, explanation: "'Amount' is used for uncountable nouns like money. Simplified Method: Amount = Uncountable." },
        { id: 30, text: "The news ____ very encouraging.", options: ["is", "are", "were", "have"], correctOptionIndex: 0, explanation: "'News' is singular. Simplified Method: News ends in 's' but is singular." },
        { id: 31, text: "She is as ____ as her sister.", options: ["beautiful", "more beautiful", "most beautiful", "beautifully"], correctOptionIndex: 0, explanation: "As...as takes the base adjective. Simplified Method: As [Base] As." },
        { id: 32, text: "I ____ seen him lately.", options: ["hasn't", "haven't", "don't", "wasn't"], correctOptionIndex: 1, explanation: "Present perfect for 'I' is 'have not'. Simplified Method: I/You/We/They have." },
        { id: 33, text: "He prefers tea ____ coffee.", options: ["than", "to", "for", "against"], correctOptionIndex: 1, explanation: "Prefer takes 'to'. Simplified Method: Prefer [A] TO [B]." },
        { id: 34, text: "The man ____ house was burnt is my uncle.", options: ["who", "whose", "whom", "which"], correctOptionIndex: 1, explanation: "Possessive 'whose'. Simplified Method: Ownership." },
        { id: 35, text: "I have only a ____ coins left.", options: ["few", "little", "bit", "some"], correctOptionIndex: 0, explanation: "'Few' for countable nouns. Simplified Method: Few = Countable." },
        { id: 36, text: "He didn't know ____ to do.", options: ["what", "which", "how", "where"], correctOptionIndex: 0, explanation: "'What' for unknown action. Simplified Method: What = Object of action." },
        { id: 37, text: "She is the ____ girl in the class.", options: ["smart", "smarter", "smartest", "most smart"], correctOptionIndex: 2, explanation: "Superlative for many is '-est'. Simplified Method: -est for the top one." },
        { id: 38, text: "You ____ not go there.", options: ["must", "has", "needs", "ought"], correctOptionIndex: 0, explanation: "Modal verb 'must' for prohibition. Simplified Method: Must = Strong command." },
        { id: 39, text: "The cat is hiding ____ the table.", options: ["under", "below", "down", "bottom"], correctOptionIndex: 0, explanation: "Under is direct vertical position below. Simplified Method: Physical position." },
        { id: 40, text: "He works ____ a bank.", options: ["in", "at", "on", "by"], correctOptionIndex: 0, explanation: "In a bank (building/institution). Simplified Method: Location within." },
        { id: 41, text: "Identify the antonym of 'Diminish':", options: ["Lessen", "Increase", "Reduce", "Shrink"], correctOptionIndex: 1, explanation: "Diminish means to make smaller, opposite is increase. Simplified Method: Dim = Less." },
        { id: 42, text: "Choose the correct sentence:", options: ["He don't like it", "He doesn't likes it", "He doesn't like it", "He didn't liked it"], correctOptionIndex: 2, explanation: "Third person singular needs 'doesn't' + base verb. Simplified Method: Does + Base." },
        { id: 43, text: "We reached the station ____ noon.", options: ["on", "at", "in", "by"], correctOptionIndex: 1, explanation: "At is used for specific times. Simplified Method: AT [Time]." },
        { id: 44, text: "The idiom 'a bolt from the blue' means:", options: ["A sudden surprise", "A thunderstorm", "A blue object", "A planned event"], correctOptionIndex: 0, explanation: "Sudden and unexpected. Simplified Method: Bolt (lightning) from nowhere." },
        { id: 45, text: "She is ____ university student.", options: ["a", "an", "the", "some"], correctOptionIndex: 0, explanation: "'University' starts with a consonant sound /j/. Simplified Method: Sound, not letter, determines a/an." },
        { id: 46, text: "Each of the houses ____ a garden.", options: ["has", "have", "are", "were"], correctOptionIndex: 0, explanation: "Each is singular. Simplified Method: Each = 1." },
        { id: 47, text: "If I were you, I ____ accept the offer.", options: ["will", "would", "shall", "can"], correctOptionIndex: 1, explanation: "Second conditional uses 'would'. Simplified Method: Hypothetical 'were' -> 'would'." },
        { id: 48, text: "He is interested ____ music.", options: ["on", "in", "at", "with"], correctOptionIndex: 1, explanation: "Interested IN. Simplified Method: Focus is 'inside' the topic." },
        { id: 49, text: "The mountain is ____ than the hill.", options: ["high", "higher", "highest", "more high"], correctOptionIndex: 1, explanation: "Comparative for two. Simplified Method: -er for comparison." },
        { id: 50, text: "He ____ his homework every day.", options: ["do", "does", "done", "doing"], correctOptionIndex: 1, explanation: "Third person singular present. Simplified Method: He/She/It + -s/es." },
        { id: 51, text: "Wait ____ I come back.", options: ["till", "until", "unless", "since"], correctOptionIndex: 1, explanation: "Until marks the end point of time. Simplified Method: Up to the point." },
        { id: 52, text: "The plural of 'Child' is:", options: ["Childs", "Children", "Childrens", "Childes"], correctOptionIndex: 1, explanation: "Irregular plural. Simplified Method: Some words change completely." },
        { id: 53, text: "He is too weak ____ walk.", options: ["to", "for", "that", "at"], correctOptionIndex: 0, explanation: "Too [Adj] TO [Verb]. Simplified Method: Restriction." },
        { id: 54, text: "I have ____ much work to do.", options: ["so", "very", "too", "great"], correctOptionIndex: 2, explanation: "Too much (excessive). Simplified Method: Too = Over the limit." },
        { id: 55, text: "Which of these is a conjunction?", options: ["But", "Fast", "High", "Under"], correctOptionIndex: 0, explanation: "Conjunctions join sentences. Simplified Method: Joining words." },
        { id: 56, text: "He jumped ____ the river.", options: ["in", "into", "on", "at"], correctOptionIndex: 1, explanation: "Into shows movement from outside to inside. Simplified Method: Into = Motion." },
        { id: 57, text: "I ____ been waiting for an hour.", options: ["has", "have", "am", "was"], correctOptionIndex: 1, explanation: "Present perfect continuous with 'I'. Simplified Method: I have been." },
        { id: 58, text: "The sun ____ in the east.", options: ["rise", "rises", "rose", "rising"], correctOptionIndex: 1, explanation: "Habitual fact in present. Simplified Method: Science facts = Simple Present." },
        { id: 59, text: "She ____ her keys yesterday.", options: ["lose", "lost", "losing", "has lost"], correctOptionIndex: 1, explanation: "Past tense for completed time (yesterday). Simplified Method: Yesterday = Simple Past." },
        { id: 60, text: "Choose the synonym of 'Courageous':", options: ["Brave", "Weak", "Fearful", "Timid"], correctOptionIndex: 0, explanation: "Courageous means brave. Simplified Method: Think 'Lionheart'." }
      ],
      "2024": [] // Empty for now, user can generate via script
    },
    [Subject.MATHEMATICS]: {
      "2025": [
        { id: 101, text: "Solve for x: \\( 2x + 5 = 15 \\)", options: ["5", "10", "7.5", "20"], correctOptionIndex: 0, explanation: "\\( 2x = 10 \\rightarrow x = 5 \\). Simplified Method: Subtract 5 then divide by 2." },
        { id: 102, text: "What is the square root of 144?", options: ["10", "12", "14", "16"], correctOptionIndex: 1, explanation: "\\( 12 \\times 12 = 144 \\). Simplified Method: 10 squared is 100, 15 squared is 225, so it's in between." },
        { id: 103, text: "Simplify: \\( 3(x + 2) - 2(x - 1) \\)", options: ["x + 8", "x + 4", "5x + 4", "x - 4"], correctOptionIndex: 0, explanation: "\\( 3x + 6 - 2x + 2 = x + 8 \\). Simplified Method: Expand brackets carefully and watch the signs." },
        { id: 104, text: "Find the area of a circle with radius 7cm (Take \\( \\pi = 22/7 \\))", options: ["154cm²", "44cm²", "49cm²", "77cm²"], correctOptionIndex: 0, explanation: "\\( A = \\pi r^2 = 22/7 \\times 7 \\times 7 = 154 \\). Simplified Method: Radius squared times Pi." },
        { id: 105, text: "If \\( a=2, b=3 \\), find \\( a^2 + b^2 \\)", options: ["5", "13", "25", "10"], correctOptionIndex: 1, explanation: "\\( 4 + 9 = 13 \\). Simplified Method: Square each first, then add." },
        { id: 106, text: "The sum of angles in a triangle is:", options: ["90°", "180°", "360°", "270°"], correctOptionIndex: 1, explanation: "Fundamental geometric property. Simplified Method: Every triangle adds up to 180." },
        { id: 107, text: "Factorize: \\( x^2 - 9 \\)", options: ["(x-3)(x-3)", "(x-3)(x+3)", "(x+9)(x-1)", "x(x-9)"], correctOptionIndex: 1, explanation: "Difference of two squares. Simplified Method: \\( a^2 - b^2 = (a-b)(a+b) \\)." },
        { id: 108, text: "What is 15% of 200?", options: ["15", "30", "45", "20"], correctOptionIndex: 1, explanation: "\\( 0.15 \\times 200 = 30 \\). Simplified Method: 10% is 20, 5% is 10. 20+10=30." },
        { id: 109, text: "Solve: \\( 3^x = 27 \\)", options: ["2", "3", "4", "9"], correctOptionIndex: 1, explanation: "\\( 3 \\times 3 \\times 3 = 27 \\). Simplified Method: How many 3s make 27?" },
        { id: 110, text: "Find the median of: 2, 5, 1, 9, 4", options: ["1", "4", "2", "5"], correctOptionIndex: 1, explanation: "Ordered: 1, 2, 4, 5, 9. Middle is 4. Simplified Method: Sort them, pick the middle." },
        { id: 111, text: "Calculate the simple interest on ₦1000 for 2 years at 5% per annum.", options: ["₦100", "₦50", "₦200", "₦10"], correctOptionIndex: 0, explanation: "\\( I = PRT/100 = 1000 \\times 5 \\times 2 / 100 = 100 \\). Simplified Method: 5% of 1000 is 50. For 2 years, it's 100." },
        { id: 112, text: "Simplify: \\( \frac{1}{2} + \frac{1}{4} \\)", options: ["2/6", "1/6", "3/4", "1/2"], correctOptionIndex: 2, explanation: "\\( 2/4 + 1/4 = 3/4 \\). Simplified Method: Common denominator is 4." },
        { id: 113, text: "The volume of a cube with side 3cm is:", options: ["9cm³", "27cm³", "18cm³", "12cm³"], correctOptionIndex: 1, explanation: "\\( 3 \\times 3 \\times 3 = 27 \\). Simplified Method: Side times side times side." },
        { id: 114, text: "Find the gradient of the line \\( y = 3x - 5 \\)", options: ["3", "-5", "5", "-3"], correctOptionIndex: 0, explanation: "In \\( y = mx + c \\), m is gradient. Simplified Method: The number before x." },
        { id: 115, text: "A die is rolled once. What is the probability of getting a 6?", options: ["1/2", "1/6", "1/3", "1/4"], correctOptionIndex: 1, explanation: "One favorable outcome out of 6. Simplified Method: Favorable / Total." },
        { id: 116, text: "Convert 0.75 to a fraction in simplest form.", options: ["75/100", "3/4", "1/4", "2/3"], correctOptionIndex: 1, explanation: "\\( 75/100 = 3/4 \\). Simplified Method: 0.25 is 1/4, so 0.75 is 3/4." },
        { id: 117, text: "If \\( 5x = 40 \\), what is \\( x/2 \\)?", options: ["8", "4", "16", "2"], correctOptionIndex: 1, explanation: "\\( x = 8 \\rightarrow 8/2 = 4 \\). Simplified Method: Find x first, then halve it." },
        { id: 118, text: "The value of \\( \cos(60^\circ) \\) is:", options: ["1/2", "√3/2", "1", "0"], correctOptionIndex: 0, explanation: "Standard trig value. Simplified Method: Remember the 30-60-90 triangle." },
        { id: 119, text: "Express 450,000 in standard form.", options: ["4.5 x 10⁵", "45 x 10⁴", "4.5 x 10⁴", "0.45 x 10⁶"], correctOptionIndex: 0, explanation: "Move decimal 5 places. Simplified Method: Count steps to get to one digit before decimal." },
        { id: 120, text: "Solve: \\( \sqrt{x} = 9 \\)", options: ["3", "18", "81", "27"], correctOptionIndex: 2, explanation: "\\( 9 \\times 9 = 81 \\). Simplified Method: Square both sides." },
        { id: 121, text: "A rectangle has length 10m and width 4m. Find its perimeter.", options: ["40m", "14m", "28m", "20m"], correctOptionIndex: 2, explanation: "\\( 2(L + W) = 2(14) = 28 \\). Simplified Method: Add all four sides." },
        { id: 122, text: "Simplify \\( x^5 \div x^2 \\)", options: ["x^7", "x^3", "x^{2.5}", "x^{10}"], correctOptionIndex: 1, explanation: "Subtract indices: \\( 5 - 2 = 3 \\). Simplified Method: Dividing powers means subtracting exponents." },
        { id: 123, text: "What is the mode of: 1, 2, 2, 3, 4, 4, 4?", options: ["2", "3", "4", "1"], correctOptionIndex: 2, explanation: "4 appears most frequently. Simplified Method: Most common number." },
        { id: 124, text: "If \\( y \propto x \\) and \\( y=10 \\) when \\( x=2 \\), find y when \\( x=5 \\)", options: ["25", "20", "15", "10"], correctOptionIndex: 0, explanation: "\\( y = kx \rightarrow 10 = 2k \rightarrow k=5. y = 5(5) = 25 \\). Simplified Method: Ratio is 5:1." },
        { id: 125, text: "The exterior angle of a regular polygon with 6 sides is:", options: ["60°", "120°", "90°", "45°"], correctOptionIndex: 0, explanation: "\\( 360/n = 360/6 = 60 \\). Simplified Method: 360 divided by number of sides." },
        { id: 126, text: "Expand: \\( (x+2)^2 \\)", options: ["x^2+4", "x^2+4x+4", "x^2+2x+4", "2x+4"], correctOptionIndex: 1, explanation: "\\( (x+2)(x+2) = x^2+2x+2x+4 \\). Simplified Method: First, Outer, Inner, Last (FOIL)." },
        { id: 127, text: "Solve: \\( x - 7 > 3 \\)", options: ["x > 4", "x > 10", "x < 10", "x > -4"], correctOptionIndex: 1, explanation: "\\( x > 10 \\). Simplified Method: Treat like equals, move -7 to other side." },
        { id: 128, text: "Calculate \\( 2^3 + 3^2 \\)", options: ["17", "12", "13", "25"], correctOptionIndex: 0, explanation: "\\( 8 + 9 = 17 \\). Simplified Method: 8 + 9." },
        { id: 129, text: "A car travels 120km in 2 hours. What is its average speed?", options: ["60km/h", "240km/h", "120km/h", "80km/h"], correctOptionIndex: 0, explanation: "\\( Speed = Distance / Time = 120/2 = 60 \\). Simplified Method: Miles per hour." },
        { id: 130, text: "What is the value of \\( 7! / 5! \\)?", options: ["42", "7", "35", "2"], correctOptionIndex: 0, explanation: "\\( 7 \times 6 = 42 \\). Simplified Method: Cancel out the common factors." },
        { id: 131, text: "Round 3.456 to 2 decimal places.", options: ["3.45", "3.46", "3.50", "3.40"], correctOptionIndex: 1, explanation: "Third digit is 6, so round up. Simplified Method: Look at the next digit." },
        { id: 132, text: "The complement of an angle of 30° is:", options: ["60°", "150°", "90°", "180°"], correctOptionIndex: 0, explanation: "\\( 90 - 30 = 60 \\). Simplified Method: Complementary angles add to 90." },
        { id: 133, text: "Find the HCF of 12 and 18.", options: ["2", "3", "6", "12"], correctOptionIndex: 2, explanation: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Common: 6. Simplified Method: Biggest number that divides both." },
        { id: 134, text: "Evaluate \\( \log_{10}(1000) \\)", options: ["2", "3", "10", "100"], correctOptionIndex: 1, explanation: "\\( 10^3 = 1000 \\). Simplified Method: Count the zeros." },
        { id: 135, text: "Solve: \\( \frac{x}{3} = 4 \\)", options: ["7", "1", "12", "1.33"], correctOptionIndex: 2, explanation: "\\( x = 12 \\). Simplified Method: Multiply both sides by 3." },
        { id: 136, text: "If a set A = {1, 2, 3}, how many subsets does it have?", options: ["3", "6", "8", "9"], correctOptionIndex: 2, explanation: "\\( 2^n = 2^3 = 8 \\). Simplified Method: 2 raised to the power of number of elements." },
        { id: 137, text: "The diameter of a circle is 14cm. Find its circumference. (\\( \\pi = 22/7 \\))", options: ["44cm", "88cm", "154cm", "22cm"], correctOptionIndex: 0, explanation: "\\( C = \pi d = 22/7 \times 14 = 44 \\). Simplified Method: Pi times Diameter." },
        { id: 138, text: "The hypotenuse of a right-angled triangle with sides 3cm and 4cm is:", options: ["5cm", "7cm", "12cm", "25cm"], correctOptionIndex: 0, explanation: "\\( \sqrt{3^2 + 4^2} = \sqrt{25} = 5 \\). Simplified Method: Pythagoras theorem." },
        { id: 139, text: "Multiply: 0.2 x 0.3", options: ["0.6", "0.06", "0.006", "6.0"], correctOptionIndex: 1, explanation: "\\( 2 \times 3 = 6 \\), move decimal 2 places. Simplified Method: Count decimal places in both." },
        { id: 140, text: "What is the value of \\( (-2)^4 \\)?", options: ["-16", "16", "-8", "8"], correctOptionIndex: 1, explanation: "Even power of negative is positive. Simplified Method: \\( -2 \times -2 \times -2 \times -2 = 16 \\)." },
        { id: 141, text: "Find the mean of 10, 20, 30.", options: ["10", "20", "30", "60"], correctOptionIndex: 1, explanation: "\\( (10+20+30)/3 = 20 \\). Simplified Method: Sum divided by count." },
        { id: 142, text: "The binary equivalent of 5 is:", options: ["101", "110", "111", "011"], correctOptionIndex: 0, explanation: "\\( 4+1 = 2^2 + 2^0 \\). Simplified Method: Powers of 2." },
        { id: 143, text: "Solve: \\( 2(x-1) = 8 \\)", options: ["5", "4", "3", "6"], correctOptionIndex: 0, explanation: "\\( x-1 = 4 \rightarrow x=5 \\). Simplified Method: Divide by 2, then add 1." },
        { id: 144, text: "What is the angle of elevation of the sun if a 2m pole casts a 2m shadow?", options: ["30°", "45°", "60°", "90°"], correctOptionIndex: 1, explanation: "\\( \tan \theta = 2/2 = 1 \rightarrow \theta = 45^\circ \\). Simplified Method: If sides are equal, angle is 45." },
        { id: 145, text: "Find the LCM of 4 and 6.", options: ["2", "12", "24", "10"], correctOptionIndex: 1, explanation: "Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... Simplified Method: Smallest number both can divide into." },
        { id: 146, text: "Simplify: \\( \sqrt{50} \\)", options: ["2√5", "5√2", "10√5", "25√2"], correctOptionIndex: 1, explanation: "\\( \sqrt{25 \times 2} = 5√2 \\). Simplified Method: Find a square factor." },
        { id: 147, text: "The slope of a horizontal line is:", options: ["1", "0", "Undefined", "Infinite"], correctOptionIndex: 1, explanation: "No rise, only run. Simplified Method: Flat lines have zero slope." },
        { id: 148, text: "If \\( f(x) = x^2 - 1 \\), find \\( f(3) \\)", options: ["8", "5", "9", "2"], correctOptionIndex: 0, explanation: "\\( 3^2 - 1 = 8 \\). Simplified Method: Plug in 3 for x." },
        { id: 149, text: "The number of degrees in a circle is:", options: ["180°", "360°", "90°", "400°"], correctOptionIndex: 1, explanation: "Standard definition. Simplified Method: Full turn." },
        { id: 150, text: "Convert 2/5 to a percentage.", options: ["20%", "40%", "50%", "25%"], correctOptionIndex: 1, explanation: "\\( 2/5 \times 100 = 40 \\). Simplified Method: 1/5 is 20%, so 2/5 is 40%." },
        { id: 151, text: "Solve: \\( 10 - x = 4 \\)", options: ["6", "14", "-6", "4"], correctOptionIndex: 0, explanation: "\\( 10 - 4 = 6 \\). Simplified Method: What do you take from 10 to get 4?" },
        { id: 152, text: "The range of: 5, 2, 8, 1 is:", options: ["7", "8", "4", "3"], correctOptionIndex: 0, explanation: "\\( 8 - 1 = 7 \\). Simplified Method: Highest minus Lowest." },
        { id: 153, text: "Simplify \\( a^3 \times a^4 \\)", options: ["a^7", "a^{12}", "a^1", "2a^7"], correctOptionIndex: 0, explanation: "Add indices: \\( 3 + 4 = 7 \\). Simplified Method: Multiplying same base means adding exponents." },
        { id: 154, text: "What is the third angle of a triangle if two are 40° and 60°?", options: ["80°", "100°", "180°", "90°"], correctOptionIndex: 0, explanation: "\\( 180 - (40+60) = 80 \\). Simplified Method: Triangle sum is 180." },
        { id: 155, text: "Find the value of x: \\( x/2 + 1 = 5 \\)", options: ["8", "4", "12", "2"], correctOptionIndex: 0, explanation: "\\( x/2 = 4 \rightarrow x=8 \\). Simplified Method: Subtract 1, then double it." },
        { id: 156, text: "A rectangle has area 50m² and length 10m. Find its width.", options: ["5m", "40m", "500m", "15m"], correctOptionIndex: 0, explanation: "\\( 50 / 10 = 5 \\). Simplified Method: Area divided by length." },
        { id: 157, text: "What is \\( 10^0 \\)?", options: ["0", "1", "10", "Undefined"], correctOptionIndex: 1, explanation: "Any non-zero number to power 0 is 1. Simplified Method: Power zero rule." },
        { id: 158, text: "Solve: \\( x^2 = 16 \\)", options: ["4 only", "±4", "8", "32"], correctOptionIndex: 1, explanation: "Both positive and negative 4 square to 16. Simplified Method: Roots can be plus or minus." },
        { id: 159, text: "The prime factors of 6 are:", options: ["1, 6", "2, 3", "1, 2, 3, 6", "2, 4"], correctOptionIndex: 1, explanation: "2 and 3 are prime and divide 6. Simplified Method: Prime numbers only." },
        { id: 160, text: "Find the area of a square with perimeter 20cm.", options: ["25cm²", "20cm²", "100cm²", "16cm²"], correctOptionIndex: 0, explanation: "\\( side = 20/4 = 5. Area = 5 \times 5 = 25 \\). Simplified Method: Find side first, then square it." }
      ]
    },
    [Subject.FURTHER_MATHS]: {
      "2025": [
        {
                "id": "fm2025_1",
                "text": "Find the roots of the quadratic equation: \\( 2x^2 - 5x + 3 = 0 \\)",
                "options": [
                        "x = 1, 1.5",
                        "x = -1, -1.5",
                        "x = 2, 3",
                        "x = 0.5, 3"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is that the factors are (2x-3)(x-1)=0. Simplified Method: Use the quadratic formula."
        },
        {
                "id": "fm2025_2",
                "text": "Solve the inequality: \\( |2x - 1| < 5 \\)",
                "options": [
                        "-2 < x < 3",
                        "x < 3",
                        "x > -2",
                        "-3 < x < 2"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is that \\( -5 < 2x - 1 < 5 \\). Simplified Method: Split into two inequalities."
        },
        {
                "id": "fm2025_3",
                "text": "Evaluate the limit: \\( \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} \\)",
                "options": [
                        "2",
                        "4",
                        "0",
                        "Undefined"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is that the expression simplifies to \\( x+2 \\). Simplified Method: Factorize and cancel."
        },
        {
                "id": "fm2025_4",
                "text": "Find the derivative of \\( f(x) = \\sin(2x) \\).",
                "options": [
                        "2 \\cos(2x)",
                        "\\cos(2x)",
                        "-2 \\cos(2x)",
                        "2 \\sin(x)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the chain rule. Simplified Method: Outer derivative times inner derivative."
        },
        {
                "id": "fm2025_5",
                "text": "Calculate the area under the curve \\( y = x^2 \\) from \\( x = 0 \\) to \\( x = 3 \\).",
                "options": [
                        "3",
                        "6",
                        "9",
                        "27"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is the integral \\( [x^3/3] \\). Simplified Method: Plug bounds into the antiderivative."
        },
        {
                "id": "fm2025_6",
                "text": "Identify the Law shown in a tip-to-tail vector diagram.",
                "imageUrl": "https://myschool.ng/storage/classroom/editor_images/scan%20(2)_LI.jpg",
                "options": [
                        "Triangle Law",
                        "Parallelogram Law",
                        "Polygon Law",
                        "Subtraction"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is that the diagram shows the Triangle Law of vector addition. Simplified Method: Tip-to-tail = Triangle."
        },
        {
                "id": "fm2025_7",
                "text": "If \\( \\vec{a} = 3i - 4j \\), find the magnitude \\( |\\vec{a}| \\).",
                "options": [
                        "1",
                        "5",
                        "7",
                        "25"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( \\sqrt{3^2 + (-4)^2} = 5 \\). Simplified Method: Use Pythagoras on the components."
        },
        {
                "id": "fm2025_8",
                "text": "Calculate the dot product of (2, 3) and (4, -1).",
                "options": [
                        "5",
                        "11",
                        "8",
                        "12"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( (2 \\times 4) + (3 \\times -1) = 5 \\). Simplified Method: Multiply components and add."
        },
        {
                "id": "fm2025_9",
                "text": "Find the 10th term of an AP where \\( a = 5 \\) and \\( d = 3 \\).",
                "options": [
                        "30",
                        "32",
                        "35",
                        "38"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( 5 + (9 \\times 3) = 32 \\). Simplified Method: Start at 5, add 3 nine times."
        },
        {
                "id": "fm2025_10",
                "text": "Sum the first 5 terms of the GP: 2, 6, 18, ...",
                "options": [
                        "242",
                        "121",
                        "80",
                        "160"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 2(3^5 - 1)/2 = 242 \\). Simplified Method: Add terms: 2, 6, 18, 54, 162."
        },
        {
                "id": "fm2025_11",
                "text": "Find the center of the circle: \\( x^2 + y^2 - 4x + 6y - 12 = 0 \\).",
                "options": [
                        "(2, -3)",
                        "(-2, 3)",
                        "(4, -6)",
                        "(2, 3)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the center is (2, -3). Simplified Method: Halve the linear coefficients and change signs."
        },
        {
                "id": "fm2025_12",
                "text": "Determine the gradient of \\( y = x^3 \\) at \\( x = 2 \\).",
                "options": [
                        "4",
                        "8",
                        "12",
                        "6"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is \\( dy/dx = 3x^2 = 12 \\). Simplified Method: Differentiate then plug in x."
        },
        {
                "id": "fm2025_13",
                "text": "Evaluate \\( \\int \\sin x dx \\).",
                "options": [
                        "\\cos x + C",
                        "-\\cos x + C",
                        "\\sin x + C",
                        "-\\sin x + C"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is that the derivative of \\( -\\cos x \\) is \\( \\sin x \\). Simplified Method: Trig integration rule."
        },
        {
                "id": "fm2025_14",
                "text": "Probability of picking a King or Queen from 52 cards.",
                "options": [
                        "2/13",
                        "1/13",
                        "4/13",
                        "8/52"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 8/52 = 2/13 \\). Simplified Method: 4 Kings + 4 Queens out of 52."
        },
        {
                "id": "fm2025_15",
                "text": "Ways to seat 5 people in a row.",
                "options": [
                        "5",
                        "25",
                        "120",
                        "60"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is \\( 5! = 120 \\). Simplified Method: Arrangement of n items is n!."
        },
        {
                "id": "fm2025_16",
                "text": "Standard deviation of: 2, 4, 6.",
                "options": [
                        "√2.67",
                        "2",
                        "√8",
                        "1.63"
                ],
                "correctOptionIndex": 3,
                "explanation": "The reason this answer is correct is S.D = 1.63. Simplified Method: Root of average squared deviations from mean."
        },
        {
                "id": "fm2025_17",
                "text": "Displacement at \\( t=2 \\) for \\( v = 2t + 3 \\).",
                "options": [
                        "7m",
                        "10m",
                        "12m",
                        "5m"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( s = t^2 + 3t = 10 \\). Simplified Method: Integrate velocity to get displacement."
        },
        {
                "id": "fm2025_18",
                "text": "Work done: F=10N, d=5m, angle=60°.",
                "options": [
                        "50J",
                        "25J",
                        "43.3J",
                        "100J"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( 10 \\times 5 \\times 0.5 = 25 \\). Simplified Method: Force times distance times cos(angle)."
        },
        {
                "id": "fm2025_19",
                "text": "Simplify: \\( (1+i)^2 \\).",
                "options": [
                        "2",
                        "2i",
                        "-2",
                        "1+2i"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( 1 + 2i - 1 = 2i \\). Simplified Method: Square of complex number."
        },
        {
                "id": "fm2025_20",
                "text": "Inverse of matrix [[1, 2], [3, 4]].",
                "options": [
                        "[[-2, 1], [1.5, -0.5]]",
                        "[[4, -2], [-3, 1]]",
                        "[[-4, 2], [3, -1]]",
                        "[[1, 0], [0, 1]]"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is using the inverse formula. Simplified Method: Adjoint divided by determinant."
        },
        {
                "id": "fm2025_21",
                "text": "Correlation coefficient if \\( \\sum xy=10, \\sum x^2=4, \\sum y^2=25 \\).",
                "options": [
                        "1.0",
                        "0.8",
                        "0.5",
                        "0.1"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 10/\\sqrt{100} = 1 \\). Simplified Method: Perfect correlation."
        },
        {
                "id": "fm2025_22",
                "text": "Evaluate \\( a * b = a + b + ab \\) for 2 * 3.",
                "options": [
                        "5",
                        "6",
                        "11",
                        "10"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is \\( 2 + 3 + 6 = 11 \\). Simplified Method: Substitute into the rule."
        },
        {
                "id": "fm2025_23",
                "text": "Sum of squares of roots for \\( x^2 - 3x + 2 = 0 \\).",
                "options": [
                        "5",
                        "9",
                        "13",
                        "4"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 3^2 - 2(2) = 5 \\). Simplified Method: Sum squared minus twice product."
        },
        {
                "id": "fm2025_24",
                "text": "Partial fraction of \\( \\frac{1}{(x-1)(x-2)} \\).",
                "options": [
                        "\\( \\frac{1}{x-2} - \\frac{1}{x-1} \\)",
                        "\\( \\frac{1}{x-1} - \\frac{1}{x-2} \\)",
                        "\\( \\frac{2}{x-2} - \\frac{1}{x-1} \\)",
                        "\\( \\frac{1}{x-2} + \\frac{1}{x-1} \\)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the decomposition. Simplified Method: Solve for coefficients A and B."
        },
        {
                "id": "fm2025_25",
                "text": "The projection of vector \\( \\vec{a} \\) on \\( \\vec{b} \\) is:",
                "options": [
                        "\\( \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|} \\)",
                        "\\( \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}|} \\)",
                        "\\( \\vec{a} \\cdot \\vec{b} \\)",
                        "\\( |\\vec{a}| \\cos \\theta \\)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the scalar projection formula. Simplified Method: Dot product divided by base magnitude."
        },
        {
                "id": "fm2025_26",
                "text": "Vertical component of 50N at 30°.",
                "options": [
                        "25N",
                        "43.3N",
                        "50N",
                        "15N"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 50 \\sin 30^\\circ = 25 \\). Simplified Method: Force times sine of angle."
        },
        {
                "id": "fm2025_27",
                "text": "Distance between (1, 2) and (4, 6).",
                "options": [
                        "5",
                        "7",
                        "√7",
                        "25"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( \\sqrt{(4-1)^2 + (6-2)^2} = 5 \\). Simplified Method: Use distance formula."
        },
        {
                "id": "fm2025_28",
                "text": "Mapping: f(x) = x^2 from R to R.",
                "options": [
                        "One-to-one",
                        "Many-to-one",
                        "Onto",
                        "Bijective"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is multiple inputs give one output. Simplified Method: Parabola mapping."
        },
        {
                "id": "fm2025_29",
                "text": "Definite integral of 2x from 1 to 4.",
                "options": [
                        "15",
                        "16",
                        "17",
                        "14"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( [x^2] \\) from 1 to 4 = 15. Simplified Method: Upper bound minus lower bound."
        },
        {
                "id": "fm2025_30",
                "text": "Unit vector of (3, 4).",
                "options": [
                        "(0.6, 0.8)",
                        "(3, 4)",
                        "(1, 1)",
                        "(0.3, 0.4)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is by dividing by magnitude 5. Simplified Method: Normalized vector."
        },
        {
                "id": "fm2025_1_b",
                "text": "Find the roots of the quadratic equation: \\( 2x^2 - 5x + 3 = 0 \\)",
                "options": [
                        "x = 1, 1.5",
                        "x = -1, -1.5",
                        "x = 2, 3",
                        "x = 0.5, 3"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is that the factors are (2x-3)(x-1)=0. Simplified Method: Use the quadratic formula."
        },
        {
                "id": "fm2025_2_b",
                "text": "Solve the inequality: \\( |2x - 1| < 5 \\)",
                "options": [
                        "-2 < x < 3",
                        "x < 3",
                        "x > -2",
                        "-3 < x < 2"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is that \\( -5 < 2x - 1 < 5 \\). Simplified Method: Split into two inequalities."
        },
        {
                "id": "fm2025_3_b",
                "text": "Evaluate the limit: \\( \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} \\)",
                "options": [
                        "2",
                        "4",
                        "0",
                        "Undefined"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is that the expression simplifies to \\( x+2 \\). Simplified Method: Factorize and cancel."
        },
        {
                "id": "fm2025_4_b",
                "text": "Find the derivative of \\( f(x) = \\sin(2x) \\).",
                "options": [
                        "2 \\cos(2x)",
                        "\\cos(2x)",
                        "-2 \\cos(2x)",
                        "2 \\sin(x)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the chain rule. Simplified Method: Outer derivative times inner derivative."
        },
        {
                "id": "fm2025_5_b",
                "text": "Calculate the area under the curve \\( y = x^2 \\) from \\( x = 0 \\) to \\( x = 3 \\).",
                "options": [
                        "3",
                        "6",
                        "9",
                        "27"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is the integral \\( [x^3/3] \\). Simplified Method: Plug bounds into the antiderivative."
        },
        {
                "id": "fm2025_6_b",
                "text": "Identify the Law shown in a tip-to-tail vector diagram.",
                "imageUrl": "https://myschool.ng/storage/classroom/editor_images/scan%20(2)_LI.jpg",
                "options": [
                        "Triangle Law",
                        "Parallelogram Law",
                        "Polygon Law",
                        "Subtraction"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is that the diagram shows the Triangle Law of vector addition. Simplified Method: Tip-to-tail = Triangle."
        },
        {
                "id": "fm2025_7_b",
                "text": "If \\( \\vec{a} = 3i - 4j \\), find the magnitude \\( |\\vec{a}| \\).",
                "options": [
                        "1",
                        "5",
                        "7",
                        "25"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( \\sqrt{3^2 + (-4)^2} = 5 \\). Simplified Method: Use Pythagoras on the components."
        },
        {
                "id": "fm2025_8_b",
                "text": "Calculate the dot product of (2, 3) and (4, -1).",
                "options": [
                        "5",
                        "11",
                        "8",
                        "12"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( (2 \\times 4) + (3 \\times -1) = 5 \\). Simplified Method: Multiply components and add."
        },
        {
                "id": "fm2025_9_b",
                "text": "Find the 10th term of an AP where \\( a = 5 \\) and \\( d = 3 \\).",
                "options": [
                        "30",
                        "32",
                        "35",
                        "38"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( 5 + (9 \\times 3) = 32 \\). Simplified Method: Start at 5, add 3 nine times."
        },
        {
                "id": "fm2025_10_b",
                "text": "Sum the first 5 terms of the GP: 2, 6, 18, ...",
                "options": [
                        "242",
                        "121",
                        "80",
                        "160"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 2(3^5 - 1)/2 = 242 \\). Simplified Method: Add terms: 2, 6, 18, 54, 162."
        },
        {
                "id": "fm2025_11_b",
                "text": "Find the center of the circle: \\( x^2 + y^2 - 4x + 6y - 12 = 0 \\).",
                "options": [
                        "(2, -3)",
                        "(-2, 3)",
                        "(4, -6)",
                        "(2, 3)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the center is (2, -3). Simplified Method: Halve the linear coefficients and change signs."
        },
        {
                "id": "fm2025_12_b",
                "text": "Determine the gradient of \\( y = x^3 \\) at \\( x = 2 \\).",
                "options": [
                        "4",
                        "8",
                        "12",
                        "6"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is \\( dy/dx = 3x^2 = 12 \\). Simplified Method: Differentiate then plug in x."
        },
        {
                "id": "fm2025_13_b",
                "text": "Evaluate \\( \\int \\sin x dx \\).",
                "options": [
                        "\\cos x + C",
                        "-\\cos x + C",
                        "\\sin x + C",
                        "-\\sin x + C"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is that the derivative of \\( -\\cos x \\) is \\( \\sin x \\). Simplified Method: Trig integration rule."
        },
        {
                "id": "fm2025_14_b",
                "text": "Probability of picking a King or Queen from 52 cards.",
                "options": [
                        "2/13",
                        "1/13",
                        "4/13",
                        "8/52"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 8/52 = 2/13 \\). Simplified Method: 4 Kings + 4 Queens out of 52."
        },
        {
                "id": "fm2025_15_b",
                "text": "Ways to seat 5 people in a row.",
                "options": [
                        "5",
                        "25",
                        "120",
                        "60"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is \\( 5! = 120 \\). Simplified Method: Arrangement of n items is n!."
        },
        {
                "id": "fm2025_16_b",
                "text": "Standard deviation of: 2, 4, 6.",
                "options": [
                        "√2.67",
                        "2",
                        "√8",
                        "1.63"
                ],
                "correctOptionIndex": 3,
                "explanation": "The reason this answer is correct is S.D = 1.63. Simplified Method: Root of average squared deviations from mean."
        },
        {
                "id": "fm2025_17_b",
                "text": "Displacement at \\( t=2 \\) for \\( v = 2t + 3 \\).",
                "options": [
                        "7m",
                        "10m",
                        "12m",
                        "5m"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( s = t^2 + 3t = 10 \\). Simplified Method: Integrate velocity to get displacement."
        },
        {
                "id": "fm2025_18_b",
                "text": "Work done: F=10N, d=5m, angle=60°.",
                "options": [
                        "50J",
                        "25J",
                        "43.3J",
                        "100J"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( 10 \\times 5 \\times 0.5 = 25 \\). Simplified Method: Force times distance times cos(angle)."
        },
        {
                "id": "fm2025_19_b",
                "text": "Simplify: \\( (1+i)^2 \\).",
                "options": [
                        "2",
                        "2i",
                        "-2",
                        "1+2i"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is \\( 1 + 2i - 1 = 2i \\). Simplified Method: Square of complex number."
        },
        {
                "id": "fm2025_20_b",
                "text": "Inverse of matrix [[1, 2], [3, 4]].",
                "options": [
                        "[[-2, 1], [1.5, -0.5]]",
                        "[[4, -2], [-3, 1]]",
                        "[[-4, 2], [3, -1]]",
                        "[[1, 0], [0, 1]]"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is using the inverse formula. Simplified Method: Adjoint divided by determinant."
        },
        {
                "id": "fm2025_21_b",
                "text": "Correlation coefficient if \\( \\sum xy=10, \\sum x^2=4, \\sum y^2=25 \\).",
                "options": [
                        "1.0",
                        "0.8",
                        "0.5",
                        "0.1"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 10/\\sqrt{100} = 1 \\). Simplified Method: Perfect correlation."
        },
        {
                "id": "fm2025_22_b",
                "text": "Evaluate \\( a * b = a + b + ab \\) for 2 * 3.",
                "options": [
                        "5",
                        "6",
                        "11",
                        "10"
                ],
                "correctOptionIndex": 2,
                "explanation": "The reason this answer is correct is \\( 2 + 3 + 6 = 11 \\). Simplified Method: Substitute into the rule."
        },
        {
                "id": "fm2025_23_b",
                "text": "Sum of squares of roots for \\( x^2 - 3x + 2 = 0 \\).",
                "options": [
                        "5",
                        "9",
                        "13",
                        "4"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 3^2 - 2(2) = 5 \\). Simplified Method: Sum squared minus twice product."
        },
        {
                "id": "fm2025_24_b",
                "text": "Partial fraction of \\( \\frac{1}{(x-1)(x-2)} \\).",
                "options": [
                        "\\( \\frac{1}{x-2} - \\frac{1}{x-1} \\)",
                        "\\( \\frac{1}{x-1} - \\frac{1}{x-2} \\)",
                        "\\( \\frac{2}{x-2} - \\frac{1}{x-1} \\)",
                        "\\( \\frac{1}{x-2} + \\frac{1}{x-1} \\)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the decomposition. Simplified Method: Solve for coefficients A and B."
        },
        {
                "id": "fm2025_25_b",
                "text": "The projection of vector \\( \\vec{a} \\) on \\( \\vec{b} \\) is:",
                "options": [
                        "\\( \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|} \\)",
                        "\\( \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}|} \\)",
                        "\\( \\vec{a} \\cdot \\vec{b} \\)",
                        "\\( |\\vec{a}| \\cos \\theta \\)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is the scalar projection formula. Simplified Method: Dot product divided by base magnitude."
        },
        {
                "id": "fm2025_26_b",
                "text": "Vertical component of 50N at 30°.",
                "options": [
                        "25N",
                        "43.3N",
                        "50N",
                        "15N"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( 50 \\sin 30^\\circ = 25 \\). Simplified Method: Force times sine of angle."
        },
        {
                "id": "fm2025_27_b",
                "text": "Distance between (1, 2) and (4, 6).",
                "options": [
                        "5",
                        "7",
                        "√7",
                        "25"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( \\sqrt{(4-1)^2 + (6-2)^2} = 5 \\). Simplified Method: Use distance formula."
        },
        {
                "id": "fm2025_28_b",
                "text": "Mapping: f(x) = x^2 from R to R.",
                "options": [
                        "One-to-one",
                        "Many-to-one",
                        "Onto",
                        "Bijective"
                ],
                "correctOptionIndex": 1,
                "explanation": "The reason this answer is correct is multiple inputs give one output. Simplified Method: Parabola mapping."
        },
        {
                "id": "fm2025_29_b",
                "text": "Definite integral of 2x from 1 to 4.",
                "options": [
                        "15",
                        "16",
                        "17",
                        "14"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is \\( [x^2] \\) from 1 to 4 = 15. Simplified Method: Upper bound minus lower bound."
        },
        {
                "id": "fm2025_30_b",
                "text": "Unit vector of (3, 4).",
                "options": [
                        "(0.6, 0.8)",
                        "(3, 4)",
                        "(1, 1)",
                        "(0.3, 0.4)"
                ],
                "correctOptionIndex": 0,
                "explanation": "The reason this answer is correct is by dividing by magnitude 5. Simplified Method: Normalized vector."
        }
]
    },
    [Subject.FURTHER_MATHS]: {
      "2025": [
        {
          id: "fm2025_1",
          text: "Find the roots of the quadratic equation: \\( 2x^2 - 5x + 3 = 0 \\)",
          options: ["x = 1, 1.5", "x = -1, -1.5", "x = 2, 3", "x = 0.5, 3"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is that the factors are (2x-3)(x-1)=0. Simplified Method: Use the quadratic formula."
        },
        {
          id: "fm2025_2",
          text: "Solve the inequality: \\( |2x - 1| < 5 \\)",
          options: ["-2 < x < 3", "x < 3", "x > -2", "-3 < x < 2"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is that \\( -5 < 2x - 1 < 5 \\). Simplified Method: Split into two inequalities."
        },
        {
          id: "fm2025_3",
          text: "Evaluate the limit: \\( \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} \\)",
          options: ["2", "4", "0", "Undefined"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is that the expression simplifies to \\( x+2 \\). Simplified Method: Factorize and cancel."
        },
        {
          id: "fm2025_4",
          text: "Find the derivative of \\( f(x) = \\sin(2x) \\).",
          options: ["2 \\cos(2x)", "\\cos(2x)", "-2 \\cos(2x)", "2 \\sin(x)"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is the chain rule. Simplified Method: Outer derivative times inner derivative."
        },
        {
          id: "fm2025_5",
          text: "Calculate the area under the curve \\( y = x^2 \\) from \\( x = 0 \\) to \\( x = 3 \\).",
          options: ["3", "6", "9", "27"],
          correctOptionIndex: 2,
          explanation: "The reason this answer is correct is the integral \\( [x^3/3] \\). Simplified Method: Plug bounds into the antiderivative."
        },
        {
          id: "fm2025_6",
          text: "Identify the Law shown in a tip-to-tail vector diagram.",
          imageUrl: "https://myschool.ng/storage/classroom/editor_images/scan%20(2)_LI.jpg",
          options: ["Triangle Law", "Parallelogram Law", "Polygon Law", "Subtraction"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is that the diagram shows the Triangle Law of vector addition. Simplified Method: Tip-to-tail = Triangle."
        },
        {
          id: "fm2025_7",
          text: "If \\( \\vec{a} = 3i - 4j \\), find the magnitude \\( |\\vec{a}| \\).",
          options: ["1", "5", "7", "25"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is \\( \\sqrt{3^2 + (-4)^2} = 5 \\). Simplified Method: Use Pythagoras on the components."
        },
        {
          id: "fm2025_8",
          text: "Calculate the dot product of (2, 3) and (4, -1).",
          options: ["5", "11", "8", "12"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( (2 \\times 4) + (3 \\times -1) = 5 \\). Simplified Method: Multiply components and add."
        },
        {
          id: "fm2025_9",
          text: "Find the 10th term of an AP where \\( a = 5 \\) and \\( d = 3 \\).",
          options: ["30", "32", "35", "38"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is \\( 5 + (9 \\times 3) = 32 \\). Simplified Method: Start at 5, add 3 nine times."
        },
        {
          id: "fm2025_10",
          text: "Sum the first 5 terms of the GP: 2, 6, 18, ...",
          options: ["242", "121", "80", "160"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( 2(3^5 - 1)/2 = 242 \\). Simplified Method: Add terms: 2, 6, 18, 54, 162."
        },
        {
          id: "fm2025_11",
          text: "Find the center of the circle: \\( x^2 + y^2 - 4x + 6y - 12 = 0 \\).",
          options: ["(2, -3)", "(-2, 3)", "(4, -6)", "(2, 3)"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is the center is (2, -3). Simplified Method: Halve the linear coefficients and change signs."
        },
        {
          id: "fm2025_12",
          text: "Determine the gradient of \\( y = x^3 \\) at \\( x = 2 \\).",
          options: ["4", "8", "12", "6"],
          correctOptionIndex: 2,
          explanation: "The reason this answer is correct is \\( dy/dx = 3x^2 = 12 \\). Simplified Method: Differentiate then plug in x."
        },
        {
          id: "fm2025_13",
          text: "Evaluate \\( \\int \\sin x dx \\).",
          options: ["\\cos x + C", "-\\cos x + C", "\\sin x + C", "-\\sin x + C"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is that the derivative of \\( -\\cos x \\) is \\( \\sin x \\). Simplified Method: Trig integration rule."
        },
        {
          id: "fm2025_14",
          text: "Probability of picking a King or Queen from 52 cards.",
          options: ["2/13", "1/13", "4/13", "8/52"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( 8/52 = 2/13 \\). Simplified Method: 4 Kings + 4 Queens out of 52."
        },
        {
          id: "fm2025_15",
          text: "Ways to seat 5 people in a row.",
          options: ["5", "25", "120", "60"],
          correctOptionIndex: 2,
          explanation: "The reason this answer is correct is \\( 5! = 120 \\). Simplified Method: Arrangement of n items is n!."
        },
        {
          id: "fm2025_16",
          text: "Standard deviation of: 2, 4, 6.",
          options: ["√2.67", "2", "√8", "1.63"],
          correctOptionIndex: 3,
          explanation: "The reason this answer is correct is S.D = 1.63. Simplified Method: Root of average squared deviations from mean."
        },
        {
          id: "fm2025_17",
          text: "Displacement at \\( t=2 \\) for \\( v = 2t + 3 \\).",
          options: ["7m", "10m", "12m", "5m"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is \\( s = t^2 + 3t = 10 \\). Simplified Method: Integrate velocity to get displacement."
        },
        {
          id: "fm2025_18",
          text: "Work done: F=10N, d=5m, angle=60°.",
          options: ["50J", "25J", "43.3J", "100J"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is \\( 10 \\times 5 \\times 0.5 = 25 \\). Simplified Method: Force times distance times cos(angle)."
        },
        {
          id: "fm2025_19",
          text: "Simplify: \\( (1+i)^2 \\).",
          options: ["2", "2i", "-2", "1+2i"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is \\( 1 + 2i - 1 = 2i \\). Simplified Method: Square of complex number."
        },
        {
          id: "fm2025_20",
          text: "Inverse of matrix [[1, 2], [3, 4]].",
          options: ["[[-2, 1], [1.5, -0.5]]", "[[4, -2], [-3, 1]]", "[[-4, 2], [3, -1]]", "[[1, 0], [0, 1]]"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is using the inverse formula. Simplified Method: Adjoint divided by determinant."
        },
        {
          id: "fm2025_21",
          text: "Correlation coefficient if \\( \\sum xy=10, \\sum x^2=4, \\sum y^2=25 \\).",
          options: ["1.0", "0.8", "0.5", "0.1"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( 10/\\sqrt{100} = 1 \\). Simplified Method: Perfect correlation."
        },
        {
          id: "fm2025_22",
          text: "Evaluate \\( a * b = a + b + ab \\) for 2 * 3.",
          options: ["5", "6", "11", "10"],
          correctOptionIndex: 2,
          explanation: "The reason this answer is correct is \\( 2 + 3 + 6 = 11 \\). Simplified Method: Substitute into the rule."
        },
        {
          id: "fm2025_23",
          text: "Sum of squares of roots for \\( x^2 - 3x + 2 = 0 \\).",
          options: ["5", "9", "13", "4"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( 3^2 - 2(2) = 5 \\). Simplified Method: Sum squared minus twice product."
        },
        {
          id: "fm2025_24",
          text: "Partial fraction of \\( \\frac{1}{(x-1)(x-2)} \\).",
          options: ["\\( \\frac{1}{x-2} - \\frac{1}{x-1} \\)", "\\( \\frac{1}{x-1} - \\frac{1}{x-2} \\)", "\\( \\frac{2}{x-2} - \\frac{1}{x-1} \\)", "\\( \\frac{1}{x-2} + \\frac{1}{x-1} \\)"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is the decomposition. Simplified Method: Solve for coefficients A and B."
        },
        {
          id: "fm2025_25",
          text: "The projection of vector \\( \\vec{a} \\) on \\( \\vec{b} \\) is:",
          options: ["\\( \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|} \\)", "\\( \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}|} \\)", "\\( \\vec{a} \\cdot \\vec{b} \\)", "\\( |\\vec{a}| \\cos \\theta \\)"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is the scalar projection formula. Simplified Method: Dot product divided by base magnitude."
        },
        {
          id: "fm2025_26",
          text: "Vertical component of 50N at 30°.",
          options: ["25N", "43.3N", "50N", "15N"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( 50 \\sin 30^\\circ = 25 \\). Simplified Method: Force times sine of angle."
        },
        {
          id: "fm2025_27",
          text: "Distance between (1, 2) and (4, 6).",
          options: ["5", "7", "√7", "25"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( \\sqrt{(4-1)^2 + (6-2)^2} = 5 \\). Simplified Method: Use distance formula."
        },
        {
          id: "fm2025_28",
          text: "Mapping: f(x) = x^2 from R to R.",
          options: ["One-to-one", "Many-to-one", "Onto", "Bijective"],
          correctOptionIndex: 1,
          explanation: "The reason this answer is correct is multiple inputs give one output. Simplified Method: Parabola mapping."
        },
        {
          id: "fm2025_29",
          text: "Definite integral of 2x from 1 to 4.",
          options: ["15", "16", "17", "14"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is \\( [x^2] \\) from 1 to 4 = 15. Simplified Method: Upper bound minus lower bound."
        },
        {
          id: "fm2025_30",
          text: "Unit vector of (3, 4).",
          options: ["(0.6, 0.8)", "(3, 4)", "(1, 1)", "(0.3, 0.4)"],
          correctOptionIndex: 0,
          explanation: "The reason this answer is correct is by dividing by magnitude 5. Simplified Method: Normalized vector."
        }
      ]
    }
  },
    [ExamType.WAEC]: {
    [Subject.ENGLISH]: {
      "2011": [
        {
                "id": "2011Ee1",
                "text": "Which of the following would be the most suitable opening for a letter to your younger sibling about the importance of education?",
                "options": [
                        "I am writing to inform you of my latest examination results.",
                        "It has come to my attention that you have been influenced by bad friends and are losing interest in your studies.",
                        "Could you please tell me when you will be coming home for the holidays?",
                        "The weather here is very cold and I hope you are staying warm."
                ],
                "correctOptionIndex": 1,
                "explanation": "A personal letter addressing a specific concern should start by stating the reason for writing. Simplified Method: State the main issue clearly and directly."
        },
        {
                "id": "2011Ee2",
                "text": "In an article on the dangers of drug abuse among Nigerian youth, which point best highlights the social consequences?",
                "options": [
                        "Drug abuse causes permanent damage to the liver and kidneys.",
                        "Youth who abuse drugs often drop out of school and engage in criminal activities.",
                        "The cost of rehabilitation is very high for many families.",
                        "Illegal drugs are often sold in hidden locations in the city."
                ],
                "correctOptionIndex": 1,
                "explanation": "Social consequences refer to the impact on the community and the individual's role in it, such as crime and education. Simplified Method: Focus on society-wide impacts."
        },
        {
                "id": "2011Ee3",
                "text": "When writing a formal letter to the PTA Chairman requesting funds for library renovation, what is the most appropriate way to suggest parent support?",
                "options": [
                        "Parents must pay an additional fee of five thousand naira each.",
                        "We suggest that parents donate high-quality books and educational materials to the library.",
                        "The government should be responsible for all library funding.",
                        "Teachers should spend their weekends organizing the library shelves."
                ],
                "correctOptionIndex": 1,
                "explanation": "Suggesting constructive ways for parents to contribute beyond just money is effective in formal requests. Simplified Method: Offer varied ways to help."
        },
        {
                "id": "2011Ee4",
                "text": "In a debate on the motion 'Social media does more harm than good to students,' which of these is a strong argument FOR the motion?",
                "options": [
                        "Social media allows students to connect with friends worldwide.",
                        "It provides a platform for creative expression and skill development.",
                        "It often leads to addiction, sleep deprivation, and exposure to cyberbullying.",
                        "Many educational resources are shared on social media platforms."
                ],
                "correctOptionIndex": 2,
                "explanation": "Arguments 'FOR' the motion must highlight the negative aspects (harm). Simplified Method: Match the 'harm' in the motion to the 'addiction/bullying' in the option."
        },
        {
                "id": "2011Ee5",
                "text": "Which of the following would be a suitable climax for a story ending with 'Honesty is the best policy'?",
                "options": [
                        "A character finds a wallet, keeps the money, and never gets caught.",
                        "A character admits to a mistake even when they could have blamed someone else, and is eventually rewarded for their truthfulness.",
                        "A character lies about their qualifications to get a job and succeeds.",
                        "A character works hard in the village and becomes a wealthy farmer."
                ],
                "correctOptionIndex": 1,
                "explanation": "The story must demonstrate the moral lesson that being honest leads to the best outcome. Simplified Method: Truth + Reward = Honesty is the best policy."
        },
        {
                "id": "2011Ee6",
                "text": "Passage: The sun was merciless that afternoon as Mallam Sani trudged along the dusty path... His worn-out slippers slapped against his heels... he lived modestly on his meagre pension...\n\nQuestion: What do Mallam Sani's worn-out slippers and faded agbada suggest about his financial situation?",
                "options": [
                        "He is very wealthy but chooses to live simply.",
                        "He is in a difficult financial state and lives a very modest life.",
                        "He is a fashion-conscious individual who likes vintage clothing.",
                        "He is an active traveler who walks long distances."
                ],
                "correctOptionIndex": 1,
                "explanation": "'Worn-out' and 'faded' are indicators of poverty or lack of funds for new items. Simplified Method: Physical appearance reflects economic status."
        },
        {
                "id": "2011Ee7",
                "text": "Passage: ...Voices rose in excitement... someone would wave a slip of paper in the air. Mallam Sani's heart skipped a beat.\n\nQuestion: Why did Mallam Sani's heart skip a beat when he saw the crowd?",
                "options": [
                        "He was afraid of the large gathering under the tree.",
                        "He realized he was late for his teaching session.",
                        "He anticipated that the scholarship results he had worked for were out.",
                        "He was exhausted from the afternoon heat."
                ],
                "correctOptionIndex": 2,
                "explanation": "The excitement and slips of paper (lists) suggest the results of the scholarship he prepared students for. Simplified Method: Anticipation of success causes emotional reaction."
        },
        {
                "id": "2011Ee8",
                "text": "Passage: ...He had prepared village children for the scholarship examination free of charge... Many had passed...\n\nQuestion: Which of these best describes the relationship between Mallam Sani and his former students?",
                "options": [
                        "Strict and professional with little personal contact.",
                        "Deeply respectful, characterized by gratitude and mentorship.",
                        "Hostile, as the students felt he worked them too hard.",
                        "Casual, like friends of the same age group."
                ],
                "correctOptionIndex": 1,
                "explanation": "The passage shows students surrounding him with joy and expressing deep thanks. Simplified Method: Mentor + Gratitude = Respectful relationship."
        },
        {
                "id": "2011Ee9",
                "text": "Passage: 'You told my parents that educating a girl educates a nation. You paid for my first school uniform yourself.'\n\nQuestion: Mention two ways Mallam Sani helped children beyond classroom teaching.",
                "options": [
                        "He bought them snacks and gave them money for transport.",
                        "He advocated for girl-child education and personally funded school needs like uniforms.",
                        "He built a new school building and hired more teachers.",
                        "He traveled to the city to buy books for himself."
                ],
                "correctOptionIndex": 1,
                "explanation": "The text explicitly mentions him talking to parents and paying for a uniform. Simplified Method: Look for actions outside the school building."
        },
        {
                "id": "2011Ee10",
                "text": "Passage: 'He had planted seeds he might never see fully grow, but tonight, he witnessed the first tender shoots.'\n\nQuestion: What is the meaning of this statement in the context of the passage?",
                "options": [
                        "Mallam Sani was a successful farmer who retired to teaching.",
                        "The students' success is the result of his long-term dedication and teaching.",
                        "He literally planted trees in the village square years ago.",
                        "He was sad that he would not live to see the children graduate."
                ],
                "correctOptionIndex": 1,
                "explanation": "The 'seeds' are the children's minds/education, and 'shoots' are their early successes like scholarships. Simplified Method: Metaphor for long-term investment in people."
        },
        {
                "id": "2011Ee11",
                "text": "Passage: '...the sun was merciless...'\n\nQuestion: What figure of speech is used in this expression?",
                "options": [
                        "Simile",
                        "Personification",
                        "Hyperbole",
                        "Metonymy"
                ],
                "correctOptionIndex": 1,
                "explanation": "The sun is given the human quality of being 'merciless'. Simplified Method: Human trait (mercy) + Non-human (sun) = Personification."
        },
        {
                "id": "2011Ee12",
                "text": "Passage: '...a harvest that would feed generations.'\n\nQuestion: What grammatical name is given to this expression?",
                "options": [
                        "Noun Phrase",
                        "Adjectival Clause",
                        "Adverbial Phrase",
                        "Noun Clause"
                ],
                "correctOptionIndex": 0,
                "explanation": "It functions as a noun within the sentence. Simplified Method: It names a thing (the harvest) and its description."
        },
        {
                "id": "2011Ee13",
                "text": "In the passage about Mallam Sani, which word can replace 'trudged'?",
                "options": [
                        "Ran",
                        "Walked heavily",
                        "Skipped",
                        "Danced"
                ],
                "correctOptionIndex": 1,
                "explanation": "Trudged implies walking with effort, often due to exhaustion or heavy terrain. Simplified Method: Slow, heavy steps."
        },
        {
                "id": "2011Ee14",
                "text": "In the passage about Mallam Sani, which word can replace 'meagre'?",
                "options": [
                        "Enormous",
                        "Sufficient",
                        "Small/Scanty",
                        "Abundant"
                ],
                "correctOptionIndex": 2,
                "explanation": "Meagre means very small in amount. Simplified Method: Meagre = Hardly enough."
        },
        {
                "id": "2011Ee15",
                "text": "What is a suitable title for the passage about Mallam Sani?",
                "options": [
                        "The Greedy School Teacher",
                        "The Village Square Celebration",
                        "The Legacy of a Dedicated Teacher",
                        "The Dangers of the Sun"
                ],
                "correctOptionIndex": 2,
                "explanation": "The passage focuses on Sani's lifelong contribution and the results of his work. Simplified Method: Focus on the main character's impact."
        },
        {
                "id": "2011Ee16",
                "text": "Passage: During sleep, our bodies repair themselves, our brains consolidate memories, and our immune systems strengthen.\n\nQuestion: According to the passage, what are the three biological processes that occur during sleep?",
                "options": [
                        "Eating, breathing, and walking",
                        "Repair, memory consolidation, and immune strengthening",
                        "Studying, watching TV, and scrolling social media",
                        "Dreaming, snoring, and talking"
                ],
                "correctOptionIndex": 1,
                "explanation": "The passage explicitly lists repair, memory, and immunity. Simplified Method: Look for the specific list in the text."
        },
        {
                "id": "2011Ee17",
                "text": "Passage: Research has linked insufficient sleep to... obesity, diabetes, and cardiovascular disease.\n\nQuestion: Mention three health problems associated with chronic sleep deprivation.",
                "options": [
                        "Headache, fever, and cough",
                        "Obesity, diabetes, and heart disease",
                        "Malaria, typhoid, and cholera",
                        "Blindness, deafness, and lameness"
                ],
                "correctOptionIndex": 1,
                "explanation": "These are the specific conditions mentioned in the second paragraph. Simplified Method: Match the diseases in the text to the options."
        },
        {
                "id": "2011Ee18",
                "text": "Passage: '...creating a phenomenon known as social jetlag.'\n\nQuestion: What is 'social jetlag' as used in the passage?",
                "options": [
                        "Traveling to a different time zone for a party.",
                        "The conflict between biological sleep needs and early school/work start times.",
                        "The feeling of being tired after using social media all night.",
                        "A type of disease caused by sleeping too much."
                ],
                "correctOptionIndex": 1,
                "explanation": "The passage defines it as the conflict between the internal clock and external schedules. Simplified Method: Internal clock vs. External clock."
        },
        {
                "id": "2011Ee19",
                "text": "Which of these is NOT mentioned as a cause of inadequate sleep among Nigerian adolescents?",
                "options": [
                        "Social media scrolling",
                        "Homework overload",
                        "Healthy diet",
                        "Early morning religious activities"
                ],
                "correctOptionIndex": 2,
                "explanation": "Homework, social media, and religious activities are listed; healthy diet is not. Simplified Method: Find the 'odd one out' in the text's list."
        },
        {
                "id": "2011Ee20",
                "text": "Passage: 'Sleep is not the enemy of productivity but its ally.'\n\nQuestion: What does this statement mean?",
                "options": [
                        "Sleep prevents you from getting work done.",
                        "Sleep and productivity are on opposite sides.",
                        "Getting enough sleep actually helps you be more productive.",
                        "Productive people never sleep."
                ],
                "correctOptionIndex": 2,
                "explanation": "An 'ally' is a helper. This means sleep supports productivity. Simplified Method: Ally = Friend/Helper."
        },
        {
                "id": "2011Ee21",
                "text": "Tunde is very troublesome and so his neighbours find it difficult to put up with him. This means that his neighbours:",
                "options": [
                        "cannot live with him under the same roof",
                        "cannot rely on him",
                        "cannot tolerate him",
                        "hate him immensely"
                ],
                "correctOptionIndex": 2,
                "explanation": "The phrasal verb 'put up with' means to tolerate, endure, or accept someone annoying. Simplified Method: Put up with = Tolerate."
        },
        {
                "id": "2011Ee22",
                "text": "The President's birthday party was attended by the cream of society. This means that:",
                "options": [
                        "the most important people were at the party",
                        "all the civil servants were at the party",
                        "other presidents attended the party",
                        "only invited guests attended the party"
                ],
                "correctOptionIndex": 0,
                "explanation": "The idiom 'the cream of society' refers to the best, most elite, or most important members. Simplified Method: Cream = Best part/Top layer."
        },
        {
                "id": "2011Ee23",
                "text": "The principal played the ostrich when she got reports of malpractices in the examination hall. This means that the principal:",
                "options": [
                        "became vigilant",
                        "behaved like an ostrich",
                        "ignored the problem",
                        "denied the reports"
                ],
                "correctOptionIndex": 2,
                "explanation": "To 'play the ostrich' means to ignore a problem or pretend it doesn't exist. Simplified Method: Head in the sand = Not seeing the problem."
        },
        {
                "id": "2011Ee24",
                "text": "Our uncle visits us only once in a blue moon. This means that our uncle:",
                "options": [
                        "visits us only when the moon is blue",
                        "seldom visits us",
                        "visits us once a year",
                        "finds it difficult to visit us"
                ],
                "correctOptionIndex": 1,
                "explanation": "'Once in a blue moon' means very rarely or seldom. Simplified Method: Rare event = Seldom."
        },
        {
                "id": "2011Ee25",
                "text": "The Principal's prompt intervention nipped last week's crisis in the bud. This means that:",
                "options": [
                        "the crisis was averted",
                        "the students were chased away",
                        "no one was willing to be part of the crisis",
                        "the students decided to obey the Principal's orders"
                ],
                "correctOptionIndex": 0,
                "explanation": "'Nip something in the bud' means to stop something at an early stage before it grows. Simplified Method: Stop it early = Prevent/Avert."
        },
        {
                "id": "2011Ee26",
                "text": "The school next door is virtually a bedlam as its students are uncontrollable. This means that:",
                "options": [
                        "the school is a playground for everybody",
                        "the students move up and down in the compound",
                        "no student is willing to stay in the classroom",
                        "the school is a place of noise and confusion"
                ],
                "correctOptionIndex": 3,
                "explanation": "'Bedlam' means a scene of uproar, chaos, noise, and confusion. Simplified Method: Bedlam = Chaos."
        },
        {
                "id": "2011Ee27",
                "text": "Mary should not criticize anybody since she too has a skeleton in her cupboard. This means that she:",
                "options": [
                        "has a secret",
                        "loves to play with skeletons",
                        "studies skeletons",
                        "does not want anybody to steal from her cupboard"
                ],
                "correctOptionIndex": 0,
                "explanation": "'A skeleton in the cupboard' means a shameful or embarrassing secret. Simplified Method: Skeleton = Hidden secret."
        },
        {
                "id": "2011Ee28",
                "text": "Araba's friends decided to send her to Coventry. This means that:",
                "options": [
                        "Araba was to be sent to a convent",
                        "she was to be sent away",
                        "her friends decided to ignore her",
                        "her friends decided to forgive her"
                ],
                "correctOptionIndex": 2,
                "explanation": "'Send someone to Coventry' means to ostracize them or refuse to speak to them. Simplified Method: Coventry = Social exclusion."
        },
        {
                "id": "2011Ee29",
                "text": "The widow works her fingers to the bone to take care of her children. This means that the widow:",
                "options": [
                        "wears out her fingers with work",
                        "is lazy",
                        "massages her bones",
                        "works extremely hard"
                ],
                "correctOptionIndex": 3,
                "explanation": "'Work one's fingers to the bone' means to work extremely hard or to exhaustion. Simplified Method: To the bone = Maximum effort."
        },
        {
                "id": "2011Ee30",
                "text": "The way the boys beat up their friends made my blood boil. This means that:",
                "options": [
                        "I was not happy with the boys",
                        "I hated the boys",
                        "my blood boiled",
                        "I was thoroughly agitated by the action of the boys"
                ],
                "correctOptionIndex": 3,
                "explanation": "'Make someone's blood boil' means to make them extremely angry or agitated. Simplified Method: Boiling blood = Intense rage."
        },
        {
                "id": "2011Ee31",
                "text": "The committee has promised to ______ the matter thoroughly before reaching a conclusion.",
                "options": [
                        "investigate",
                        "investigation",
                        "investigating",
                        "investigated"
                ],
                "correctOptionIndex": 0,
                "explanation": "'Promised to' is followed by the base form of the verb. Simplified Method: To + Base Verb."
        },
        {
                "id": "2011Ee32",
                "text": "Neither the principal nor the teachers ______ satisfied with the examination results.",
                "options": [
                        "is",
                        "are",
                        "was",
                        "were"
                ],
                "correctOptionIndex": 1,
                "explanation": "When 'neither...nor' is used, the verb agrees with the closer subject ('teachers'). Simplified Method: Match the closest person/group."
        },
        {
                "id": "2011Ee33",
                "text": "The management has decided to ______ the workers' salaries by 15% due to economic hardship.",
                "options": [
                        "rise",
                        "raise",
                        "arise",
                        "rose"
                ],
                "correctOptionIndex": 1,
                "explanation": "'Raise' is a transitive verb meaning to increase something. Simplified Method: You raise something (salaries)."
        },
        {
                "id": "2011Ee34",
                "text": "If I ______ you, I would accept the scholarship without hesitation.",
                "options": [
                        "am",
                        "was",
                        "were",
                        "be"
                ],
                "correctOptionIndex": 2,
                "explanation": "Hypothetical 'if' clauses use 'were' for all persons. Simplified Method: If + were = Imaginary/Hypothetical."
        },
        {
                "id": "2011Ee35",
                "text": "The governor, together with his aides, ______ expected to arrive at noon.",
                "options": [
                        "is",
                        "are",
                        "were",
                        "have been"
                ],
                "correctOptionIndex": 0,
                "explanation": "'Together with' phrases don't change the number of the subject ('governor'). Simplified Method: The word after 'together with' doesn't count for the verb."
        },
        {
                "id": "2011Ee36",
                "text": "Ade has been suffering from malaria ______ three days.",
                "options": [
                        "since",
                        "for",
                        "from",
                        "within"
                ],
                "correctOptionIndex": 1,
                "explanation": "'For' is used for a duration/period of time. Simplified Method: For + Amount of time."
        },
        {
                "id": "2011Ee37",
                "text": "The students were told to do the assignment ______.",
                "options": [
                        "themselves",
                        "themself",
                        "theirselves",
                        "their self"
                ],
                "correctOptionIndex": 0,
                "explanation": "The standard reflexive pronoun for plural 'them' is 'themselves'. Simplified Method: Self (1) -> Selves (Many)."
        },
        {
                "id": "2011Ee38",
                "text": "Hardly ______ entered the hall when the lights went off.",
                "options": [
                        "had he",
                        "he had",
                        "did he",
                        "he did"
                ],
                "correctOptionIndex": 0,
                "explanation": "Inverted word order is used after 'Hardly' at the start of a sentence. Simplified Method: Negative word at start = Verb before Subject."
        },
        {
                "id": "2011Ee39",
                "text": "The teacher asked each of the students to bring ______ own dictionary.",
                "options": [
                        "his",
                        "their",
                        "our",
                        "one's"
                ],
                "correctOptionIndex": 0,
                "explanation": "'Each' is singular, so it takes the singular possessive 'his' (or 'his or her'). Simplified Method: Each = 1 = His."
        },
        {
                "id": "2011Ee40",
                "text": "By this time next year, I ______ my university education.",
                "options": [
                        "will complete",
                        "will have completed",
                        "would complete",
                        "completed"
                ],
                "correctOptionIndex": 1,
                "explanation": "Future perfect tense indicates an action completed by a future point. Simplified Method: By [Future Time] = Will have [Done]."
        },
        {
                "id": "2011Ee41",
                "text": "Choose the word nearest in meaning: The chairman's speech was 'ambiguous' and left many people confused.",
                "options": [
                        "clear",
                        "unclear",
                        "brief",
                        "lengthy"
                ],
                "correctOptionIndex": 1,
                "explanation": "Ambiguous means having more than one possible meaning; open to doubt. Simplified Method: Multi-meaning = Confusing = Unclear."
        },
        {
                "id": "2011Ee42",
                "text": "Choose the word nearest in meaning: The young man displayed 'remarkable' courage during the accident.",
                "options": [
                        "ordinary",
                        "little",
                        "exceptional",
                        "fake"
                ],
                "correctOptionIndex": 2,
                "explanation": "Remarkable means worthy of attention; striking; exceptional. Simplified Method: Remarkable = Stand-out = Exceptional."
        },
        {
                "id": "2011Ee43",
                "text": "Choose the word nearest in meaning: The company decided to 'terminate' his appointment due to gross misconduct.",
                "options": [
                        "extend",
                        "renew",
                        "end",
                        "celebrate"
                ],
                "correctOptionIndex": 2,
                "explanation": "To terminate means to bring to an end. Simplified Method: Terminate = End/Finish."
        },
        {
                "id": "2011Ee44",
                "text": "Choose the word opposite in meaning: The food was 'plentiful' at the party.",
                "options": [
                        "enough",
                        "scarce",
                        "delicious",
                        "expensive"
                ],
                "correctOptionIndex": 1,
                "explanation": "Plentiful means in large quantities; the opposite is scarce (very little). Simplified Method: Many vs. Very few."
        },
        {
                "id": "2011Ee45",
                "text": "Choose the word opposite in meaning: He is known for his 'honest' dealings with clients.",
                "options": [
                        "fair",
                        "prompt",
                        "corrupt",
                        "generous"
                ],
                "correctOptionIndex": 2,
                "explanation": "Honest means truthful; the opposite is corrupt or dishonest. Simplified Method: Truthful vs. Crooked."
        },
        {
                "id": "2011Ee46",
                "text": "The importance of reading cannot be overemphasized. Reading [46] our knowledge and exposes us to new ideas.",
                "options": [
                        "broadens",
                        "limits",
                        "reduces",
                        "narrows"
                ],
                "correctOptionIndex": 0,
                "explanation": "Reading expands or increases knowledge. Simplified Method: Knowledge grows = Broadens."
        },
        {
                "id": "2011Ee47",
                "text": "It also [47] our vocabulary and improves our writing skills.",
                "options": [
                        "destroys",
                        "enhances",
                        "weakens",
                        "complicates"
                ],
                "correctOptionIndex": 1,
                "explanation": "Enhance means to improve the quality or value of something. Simplified Method: Enhance = Improve."
        },
        {
                "id": "2011Ee48",
                "text": "Unfortunately, many young people today prefer watching television or [48] social media to reading books.",
                "options": [
                        "use",
                        "used",
                        "using",
                        "uses"
                ],
                "correctOptionIndex": 2,
                "explanation": "Parallel structure: 'watching television or USING social media'. Simplified Method: -ing + or + -ing."
        },
        {
                "id": "2011Ee49",
                "text": "The doctor prescribed ______ for the patient's infection.",
                "options": [
                        "vegetables",
                        "antibiotics",
                        "exercise",
                        "water"
                ],
                "correctOptionIndex": 1,
                "explanation": "Antibiotics are used specifically to treat infections. Simplified Method: Infection = Antibiotics."
        },
        {
                "id": "2011Ee50",
                "text": "The accountant discovered a ______ in the company's financial records.",
                "options": [
                        "donation",
                        "discrepancy",
                        "benefit",
                        "profit"
                ],
                "correctOptionIndex": 1,
                "explanation": "A discrepancy is a lack of compatibility or similarity between two facts. Simplified Method: Discrepancy = Difference/Error."
        },
        {
                "id": "2011Ee51",
                "text": "Choose the word with the same vowel sound as the one in 'boot':",
                "options": [
                        "put",
                        "book",
                        "food",
                        "foot"
                ],
                "correctOptionIndex": 2,
                "explanation": "Boot and food both have the long /u:/ sound. Simplified Method: Long 'oo' sound."
        },
        {
                "id": "2011Ee52",
                "text": "Choose the word with the same vowel sound as the one in 'cat':",
                "options": [
                        "hate",
                        "mat",
                        "late",
                        "eight"
                ],
                "correctOptionIndex": 1,
                "explanation": "Cat and mat both have the short /æ/ sound. Simplified Method: Short 'a' sound."
        },
        {
                "id": "2011Ee53",
                "text": "Choose the word with the same consonant sound as the one in 'ship':",
                "options": [
                        "chip",
                        "sheep",
                        "cheap",
                        "zip"
                ],
                "correctOptionIndex": 1,
                "explanation": "Ship and sheep both have the /ʃ/ sound. Simplified Method: 'Sh' sound."
        },
        {
                "id": "2011Ee54",
                "text": "Choose the word with the same consonant sound as the one in 'physics':",
                "options": [
                        "philosophy",
                        "photo",
                        "phone",
                        "fat"
                ],
                "correctOptionIndex": 0,
                "explanation": "Philosophy and physics both have the /f/ sound (represented by ph). Simplified Method: Ph sounds like F."
        },
        {
                "id": "2011Ee55",
                "text": "Choose the word that rhymes with 'light':",
                "options": [
                        "lit",
                        "late",
                        "bite",
                        "height"
                ],
                "correctOptionIndex": 2,
                "explanation": "Bite rhymes with light (/laɪt/ and /baɪt/). Simplified Method: Same ending sound."
        },
        {
                "id": "2011Ee56",
                "text": "Identify the correctly stressed syllable: education",
                "options": [
                        "ED-u-ca-tion",
                        "e-DU-ca-tion",
                        "e-du-CA-tion",
                        "e-du-ca-TION"
                ],
                "correctOptionIndex": 2,
                "explanation": "Words ending in -tion are usually stressed on the syllable before the suffix. Simplified Method: Stress is on 'CA'."
        },
        {
                "id": "2011Ee57",
                "text": "Identify the word with a different stress pattern:",
                "options": [
                        "TABLE",
                        "CHAIRman",
                        "beGIN",
                        "WINdow"
                ],
                "correctOptionIndex": 2,
                "explanation": "TABLE, CHAIRman, and WINdow are stressed on the first syllable; beGIN is stressed on the second. Simplified Method: First-syllable vs. Second-syllable."
        },
        {
                "id": "2011Ee58",
                "text": "My sister PASSED the examination. (Emphatic stress on PASSED). Which question does this answer?",
                "options": [
                        "Did my brother pass the examination?",
                        "Did my sister fail the examination?",
                        "Did my sister pass the interview?",
                        "Did my mother pass the examination?"
                ],
                "correctOptionIndex": 1,
                "explanation": "Emphatic stress on the verb 'PASSED' contradicts 'fail'. Simplified Method: Emphasize the part that is different from the wrong assumption."
        },
        {
                "id": "2011Ee59",
                "text": "She bought a RED car. (Emphatic stress on RED). Which question does this answer?",
                "options": [
                        "Did she steal a red car?",
                        "Did she buy a blue car?",
                        "Did he buy a red car?",
                        "Did she buy a red bicycle?"
                ],
                "correctOptionIndex": 1,
                "explanation": "Emphatic stress on 'RED' contrasts with another color like 'blue'. Simplified Method: Focus on the color."
        },
        {
                "id": "2011Ee60",
                "text": "Identify the word with the sound represented by /θ/:",
                "options": [
                        "this",
                        "that",
                        "these",
                        "thought"
                ],
                "correctOptionIndex": 3,
                "explanation": "The symbol /θ/ represents the voiceless 'th' sound in 'thought'. Simplified Method: Airy 'th' sound."
        },
        {
                "id": "2011Ee61",
                "text": "Passage: 'One of the most profound benefits of technology in education is access to information... Through the internet, students can now explore vast libraries...'\n\nQuestion: Which of the following sentences best summarizes the first benefit of technology mentioned in the passage?",
                "options": [
                        "Technology makes students lazier by providing all answers.",
                        "The internet provides unprecedented access to a vast array of global information and libraries.",
                        "Every student in Nigeria now has a smartphone and internet access.",
                        "Libraries are becoming obsolete because of the internet."
                ],
                "correctOptionIndex": 1,
                "explanation": "The passage highlights the 'democratization of information' via the internet. Simplified Method: Focus on the main positive result (access to info)."
        },
        {
                "id": "2011Ee62",
                "text": "Passage: '...technology enables personalized learning experiences. Educational software can adapt to individual student's pace...'\n\nQuestion: In one sentence, what is the second benefit of technology in education?",
                "options": [
                        "It allows teachers to take longer breaks during lessons.",
                        "It facilitates customized learning experiences that adapt to each student's unique learning speed.",
                        "It ensures that all students finish their syllabus at the same time.",
                        "It replaces the need for any human interaction in the classroom."
                ],
                "correctOptionIndex": 1,
                "explanation": "The text discusses 'personalized learning' and 'adapting to individual student's pace'. Simplified Method: Personalized = Adapted to the individual."
        },
        {
                "id": "2011Ee63",
                "text": "Passage: 'Interactive simulations and virtual laboratories allow students to conduct experiments...'\n\nQuestion: What is the third benefit of technology discussed in the passage?",
                "options": [
                        "It makes experiments safer by removing all chemicals from schools.",
                        "It provides opportunities for students to engage in practical learning through digital simulations.",
                        "It proves that traditional laboratories are a waste of money.",
                        "It allows students to play games during science classes."
                ],
                "correctOptionIndex": 1,
                "explanation": "The passage mentions 'interactive simulations' as a tool for experiments. Simplified Method: Virtual labs = Practical digital learning."
        },
        {
                "id": "2011Ee64",
                "text": "Passage: 'The most obvious [challenge] is the digital divide—the gap between those who have access to technology and those who do not.'\n\nQuestion: What is the first major challenge of technology integration mentioned?",
                "options": [
                        "The high cost of electricity in urban areas.",
                        "The inequality in access to digital tools, often referred to as the digital divide.",
                        "The lack of interesting educational software for students.",
                        "The difficulty of carrying heavy laptops to school."
                ],
                "correctOptionIndex": 1,
                "explanation": "The text explicitly names the 'digital divide' as a gap in access. Simplified Method: Digital Divide = Inequality in access."
        },
        {
                "id": "2011Ee65",
                "text": "Passage: 'Additionally, technology can be a significant source of distraction. Students... often struggle to resist the temptation of social media...'\n\nQuestion: Which statement best summarizes the second challenge discussed?",
                "options": [
                        "Teachers are not well-trained to use computers.",
                        "Social media is more important than classroom learning.",
                        "Digital devices can significantly divert students' attention away from their studies.",
                        "Smartphones should be banned in all Nigerian schools."
                ],
                "correctOptionIndex": 2,
                "explanation": "The text focuses on 'distraction' from social media and games. Simplified Method: Distraction = Loss of focus."
        },
        {
                "id": "2011Ee66",
                "text": "Passage: 'There is also the concern about the quality and reliability of online information... students... may absorb misinformation.'\n\nQuestion: What is the third challenge identified by the writer?",
                "options": [
                        "The internet is too expensive for most students.",
                        "The difficulty of finding any information on the internet.",
                        "The presence of inaccurate or unreliable information that students may accept without questioning.",
                        "The fact that most websites are written in foreign languages."
                ],
                "correctOptionIndex": 2,
                "explanation": "The writer is concerned with 'quality and reliability' and 'misinformation'. Simplified Method: Not everything online is true."
        },
        {
                "id": "2011Ee67",
                "text": "Passage: '...the over-reliance on technology may erode fundamental skills. Handwriting, mental arithmetic... may atrophy...'\n\nQuestion: What is the final challenge of technology mentioned in the passage?",
                "options": [
                        "The physical damage to eyes from looking at screens.",
                        "The potential decline of basic traditional skills like handwriting and mental calculation.",
                        "The lack of jobs for teachers in the future.",
                        "The high cost of repairing broken tablets and phones."
                ],
                "correctOptionIndex": 1,
                "explanation": "The text mentions the 'erosion of fundamental skills' like handwriting. Simplified Method: Skills atrophy = Use it or lose it."
        },
        {
                "id": "2011Ee68",
                "text": "Passage: 'This requires thoughtful integration... Technology should serve educational goals, not dictate them.'\n\nQuestion: According to the writer, how can educators effectively address the challenges of technology?",
                "options": [
                        "By completely removing technology from schools.",
                        "By letting students decide which technology to use.",
                        "By integrating technology thoughtfully so it serves specific educational objectives.",
                        "By replacing all traditional textbooks with digital ones."
                ],
                "correctOptionIndex": 2,
                "explanation": "The writer advocates for 'thoughtful integration' where technology 'serves goals'. Simplified Method: Plan the use; don't just use it for the sake of it."
        },
        {
                "id": "2011Ee69",
                "text": "Passage: 'Teachers must be trained not just to use technology, but to use it effectively. Students must be taught digital literacy...'\n\nQuestion: What are two key solutions for successful technology adoption in education?",
                "options": [
                        "Buying more computers and building faster networks.",
                        "Effective teacher training and teaching students digital literacy.",
                        "Reducing school hours and increasing homework.",
                        "Hiring IT experts to replace classroom teachers."
                ],
                "correctOptionIndex": 1,
                "explanation": "The text emphasizes 'teacher training' and 'digital literacy'. Simplified Method: Training + Literacy = Success."
        },
        {
                "id": "2011Ee70",
                "text": "Passage: 'The ideal classroom of the future may blend the best of both worlds: the personal connection of human instruction combined with the vast resources... of digital tools.'\n\nQuestion: In one sentence, what is the writer's vision for the ideal future classroom?",
                "options": [
                        "A classroom where robots teach students everything.",
                        "A classroom that relies solely on traditional, non-digital methods.",
                        "A balanced environment that combines human mentorship with powerful digital resources.",
                        "A virtual space where students never meet in person."
                ],
                "correctOptionIndex": 2,
                "explanation": "The vision is a 'blend' of 'human instruction' and 'digital tools'. Simplified Method: Human + Tech = Ideal Future."
        }
],
      "2025": []
    },
    [Subject.MATHEMATICS]: {
      "2025": []
    }
  },
  [ExamType.NECO]: {
    [Subject.ENGLISH]: {
      "2025": []
    },
    [Subject.MATHEMATICS]: {
      "2025": []
    }
  }
};

// Mirroring the data
fallbackData[ExamType.WAEC][Subject.ENGLISH]["2025"] = fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"];
fallbackData[ExamType.NECO][Subject.ENGLISH]["2025"] = fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"];
fallbackData[ExamType.WAEC][Subject.MATHEMATICS]["2025"] = fallbackData[ExamType.JAMB][Subject.MATHEMATICS]["2025"];
fallbackData[ExamType.NECO][Subject.MATHEMATICS]["2025"] = fallbackData[ExamType.JAMB][Subject.MATHEMATICS]["2025"];

fallbackData[ExamType.WAEC][Subject.FURTHER_MATHS] = { "2025": [] };
fallbackData[ExamType.NECO][Subject.FURTHER_MATHS] = { "2025": [] };
fallbackData[ExamType.WAEC][Subject.FURTHER_MATHS]["2025"] = fallbackData[ExamType.JAMB][Subject.FURTHER_MATHS]["2025"];
fallbackData[ExamType.NECO][Subject.FURTHER_MATHS]["2025"] = fallbackData[ExamType.JAMB][Subject.FURTHER_MATHS]["2025"];

fallbackData[ExamType.WAEC][Subject.FURTHER_MATHS] = { "2025": [] };
fallbackData[ExamType.NECO][Subject.FURTHER_MATHS] = { "2025": [] };
fallbackData[ExamType.WAEC][Subject.FURTHER_MATHS]["2025"] = fallbackData[ExamType.JAMB][Subject.FURTHER_MATHS]["2025"];
fallbackData[ExamType.NECO][Subject.FURTHER_MATHS]["2025"] = fallbackData[ExamType.JAMB][Subject.FURTHER_MATHS]["2025"];
