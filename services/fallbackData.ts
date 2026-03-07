
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
        { id: 102, text: "What is $\\sqrt{144}$?", options: ["10", "12", "14", "16"], correctOptionIndex: 1, explanation: "\\( 12 \\times 12 = 144 \\). Simplified Method: 10 squared is 100, 15 squared is 225, so it's in between." },
        { id: 103, text: "Simplify: \\( 3(x + 2) - 2(x - 1) \\)", options: ["$x + 8$", "$x + 4$", "$5x + 4$", "$x - 4$"], correctOptionIndex: 0, explanation: "\\( 3x + 6 - 2x + 2 = x + 8 \\). Simplified Method: Expand brackets carefully and watch the signs." },
        { id: 104, text: "Find the area of a circle with radius 7cm, $\\pi = \\frac{22}{7}$", options: ["154cm²", "44cm²", "49cm²", "77cm²"], correctOptionIndex: 0, explanation: "\\( A = \\pi r^2 = \\frac{22}{7} \\times 7 \\times 7 = 154 \\). Simplified Method: Radius squared times Pi." },
        { id: 105, text: "If \\( a=2, b=3 \\), find \\( a^2 + b^2 \\)", options: ["5", "13", "25", "10"], correctOptionIndex: 1, explanation: "\\( 4 + 9 = 13 \\). Simplified Method: Square each first, then add." },
        { id: 106, text: "The sum of angles in a triangle is:", options: ["90°", "180°", "360°", "270°"], correctOptionIndex: 1, explanation: "Fundamental geometric property. Simplified Method: Every triangle adds up to 180." },
        { id: 107, text: "Factorize: \\( x^2 - 9 \\)", options: ["(x-3)(x-3)", "(x-3)(x+3)", "(x+9)(x-1)", "x(x-9)"], correctOptionIndex: 1, explanation: "Difference of two squares. Simplified Method: \\( a^2 - b^2 = (a-b)(a+b) \\)." },
        { id: 108, text: "What is 15% of 200?", options: ["15", "30", "45", "20"], correctOptionIndex: 1, explanation: "\\( 0.15 \\times 200 = 30 \\). Simplified Method: 10% is 20, 5% is 10. 20+10=30." },
        { id: 109, text: "Solve: \\( 3^x = 27 \\)", options: ["2", "3", "4", "9"], correctOptionIndex: 1, explanation: "\\( 3 \\times 3 \\times 3 = 27 \\). Simplified Method: How many 3s make 27?" },
        { id: 110, text: "Find the median of: 2, 5, 1, 9, 4", options: ["1", "4", "2", "5"], correctOptionIndex: 1, explanation: "Ordered: 1, 2, 4, 5, 9. Middle is 4. Simplified Method: Sort them, pick the middle." },
        { id: 111, text: "Calculate the simple interest on ₦1000 for 2 years at 5% per annum.", options: ["₦100", "₦50", "₦200", "₦10"], correctOptionIndex: 0, explanation: "\\( I = PRT/100 = 1000 \\times 5 \\times 2 / 100 = 100 \\). Simplified Method: 5% of 1000 is 50. For 2 years, it's 100." },
        { id: 112, text: "Simplify: \\( \\frac{1}{2} + \\frac{1}{4} \\)", options: ["2/6", "1/6", "3/4", "1/2"], correctOptionIndex: 2, explanation: "\\( 2/4 + 1/4 = 3/4 \\). Simplified Method: Common denominator is 4." },
        { id: 113, text: "The volume of a cube with side 3cm is:", options: ["9cm³", "27cm³", "18cm³", "12cm³"], correctOptionIndex: 1, explanation: "\\( 3 \\times 3 \\times 3 = 27 \\). Simplified Method: Side times side times side." },
        { id: 114, text: "Find the gradient of the line \\( y = 3x - 5 \\)", options: ["3", "-5", "5", "-3"], correctOptionIndex: 0, explanation: "In \\( y = mx + c \\), m is gradient. Simplified Method: The number before x." },
        { id: 115, text: "A die is rolled once. What is the probability of getting a 6?", options: ["1/2", "1/6", "1/3", "1/4"], correctOptionIndex: 1, explanation: "One favorable outcome out of 6. Simplified Method: Favorable / Total." },
        { id: 116, text: "Convert 0.75 to a fraction in simplest form.", options: ["75/100", "3/4", "1/4", "2/3"], correctOptionIndex: 1, explanation: "\\( 75/100 = 3/4 \\). Simplified Method: 0.25 is 1/4, so 0.75 is 3/4." },
        { id: 117, text: "If \\( 5x = 40 \\), what is \\( x/2 \\)?", options: ["8", "4", "16", "2"], correctOptionIndex: 1, explanation: "\\( x = 8 \\rightarrow 8/2 = 4 \\). Simplified Method: Find x first, then halve it." },
        { id: 118, text: "The value of \\( \\cos(60^\\circ) \\) is:", options: ["$\\frac{1}{2}$", "$\\frac{\\sqrt{3}}{2}$", "1", "0"], correctOptionIndex: 0, explanation: "Standard trig value. Simplified Method: Remember the 30-60-90 triangle." },
        { id: 119, text: "Express 450,000 in standard form.", options: ["$4.5 \\times 10^5$", "$45 \\times 10^4$", "$4.5 \\times 10^4$", "$0.45 \\times 10^6$"], correctOptionIndex: 0, explanation: "Move decimal 5 places. Simplified Method: Count steps to get to one digit before decimal." },
        { id: 120, text: "Solve: \\( \\sqrt{x} = 9 \\)", options: ["3", "18", "81", "27"], correctOptionIndex: 2, explanation: "\\( 9 \\times 9 = 81 \\). Simplified Method: Square both sides." },
        { id: 121, text: "A rectangle has length 10m and width 4m. Find its perimeter.", options: ["40m", "14m", "28m", "20m"], correctOptionIndex: 2, explanation: "\\( 2(L + W) = 2(14) = 28 \\). Simplified Method: Add all four sides." },
        { id: 122, text: "Simplify \\( x^5 \\div x^2 \\)", options: ["$x^7$", "$x^3$", "$x^{2.5}$", "$x^{10}$"], correctOptionIndex: 1, explanation: "Subtract indices: \\( 5 - 2 = 3 \\). Simplified Method: Dividing powers means subtracting exponents." },
        { id: 123, text: "What is the mode of: 1, 2, 2, 3, 4, 4, 4?", options: ["2", "3", "4", "1"], correctOptionIndex: 2, explanation: "4 appears most frequently. Simplified Method: Most common number." },
        { id: 124, text: "If \\( y \\propto x \\) and \\( y=10 \\) when \\( x=2 \\), find y when \\( x=5 \\)", options: ["25", "20", "15", "10"], correctOptionIndex: 0, explanation: "\\( y = kx \\rightarrow 10 = 2k \\rightarrow k=5. y = 5(5) = 25 \\). Simplified Method: Ratio is 5:1." },
        { id: 125, text: "The exterior angle of a regular polygon with 6 sides is:", options: ["60°", "120°", "90°", "45°"], correctOptionIndex: 0, explanation: "\\( 360/n = 360/6 = 60 \\). Simplified Method: 360 divided by number of sides." },
        { id: 126, text: "Expand: \\( (x+2)^2 \\)", options: ["$x^2+4$", "$x^2+4x+4$", "$x^2+2x+4$", "$2x+4$"], correctOptionIndex: 1, explanation: "\\( (x+2)(x+2) = x^2+2x+2x+4 \\). Simplified Method: First, Outer, Inner, Last (FOIL)." },
        { id: 127, text: "Solve: \\( x - 7 > 3 \\)", options: ["$x > 4$", "$x > 10$", "$x < 10$", "$x > -4$"], correctOptionIndex: 1, explanation: "\\( x > 10 \\). Simplified Method: Treat like equals, move -7 to other side." },
        { id: 128, text: "Calculate \\( 2^3 + 3^2 \\)", options: ["17", "12", "13", "25"], correctOptionIndex: 0, explanation: "\\( 8 + 9 = 17 \\). Simplified Method: 8 + 9." },
        { id: 129, text: "A car travels 120km in 2 hours. What is its average speed?", options: ["60km/h", "240km/h", "120km/h", "80km/h"], correctOptionIndex: 0, explanation: "\\( Speed = Distance / Time = 120/2 = 60 \\). Simplified Method: Miles per hour." },
        { id: 130, text: "What is the value of \\( 7! / 5! \\)?", options: ["42", "7", "35", "2"], correctOptionIndex: 0, explanation: "\\( 7 \\times 6 = 42 \\). Simplified Method: Cancel out the common factors." },
        { id: 131, text: "Round 3.456 to 2 decimal places.", options: ["3.45", "3.46", "3.50", "3.40"], correctOptionIndex: 1, explanation: "Third digit is 6, so round up. Simplified Method: Look at the next digit." },
        { id: 132, text: "The complement of an angle of 30° is:", options: ["60°", "150°", "90°", "180°"], correctOptionIndex: 0, explanation: "\\( 90 - 30 = 60 \\). Simplified Method: Complementary angles add to 90." },
        { id: 133, text: "Find the HCF of 12 and 18.", options: ["2", "3", "6", "12"], correctOptionIndex: 2, explanation: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Common: 6. Simplified Method: Biggest number that divides both." },
        { id: 134, text: "Evaluate \\( \\log_{10}(1000) \\)", options: ["2", "3", "10", "100"], correctOptionIndex: 1, explanation: "\\( 10^3 = 1000 \\). Simplified Method: Count the zeros." },
        { id: 135, text: "Solve: \\( \\frac{x}{3} = 4 \\)", options: ["7", "1", "12", "1.33"], correctOptionIndex: 2, explanation: "\\( x = 12 \\). Simplified Method: Multiply both sides by 3." },
        { id: 136, text: "If a set A = {1, 2, 3}, how many subsets does it have?", options: ["3", "6", "8", "9"], correctOptionIndex: 2, explanation: "\\( 2^n = 2^3 = 8 \\). Simplified Method: 2 raised to the power of number of elements." },
        { id: 137, text: "The diameter of a circle is 14cm. Find its circumference, $\\pi = \\frac{22}{7}$", options: ["44cm", "88cm", "154cm", "22cm"], correctOptionIndex: 0, explanation: "\\( C = \\pi d = \\frac{22}{7} \\times 14 = 44 \\). Simplified Method: Pi times Diameter." },
        { id: 138, text: "The hypotenuse of a right-angled triangle with sides 3cm and 4cm is:", options: ["5cm", "7cm", "12cm", "25cm"], correctOptionIndex: 0, explanation: "\\( \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5 \\). Simplified Method: Pythagoras theorem." },
        { id: 139, text: "Multiply: 0.2 x 0.3", options: ["0.6", "0.06", "0.006", "6.0"], correctOptionIndex: 1, explanation: "\\( 2 \\times 3 = 6 \\), move decimal 2 places. Simplified Method: Count decimal places in both." },
        { id: 140, text: "What is the value of \\( (-2)^4 \\)?", options: ["-16", "16", "-8", "8"], correctOptionIndex: 1, explanation: "Even power of negative is positive. Simplified Method: \\( -2 \\times -2 \\times -2 \\times -2 = 16 \\)." },
        { id: 141, text: "Find the mean of 10, 20, 30.", options: ["10", "20", "30", "60"], correctOptionIndex: 1, explanation: "\\( (10+20+30)/3 = 20 \\). Simplified Method: Sum divided by count." },
        { id: 142, text: "The binary equivalent of 5 is:", options: ["101", "110", "111", "011"], correctOptionIndex: 0, explanation: "\\( 4+1 = 2^2 + 2^0 \\). Simplified Method: Powers of 2." },
        { id: 143, text: "Solve: \\( 2(x-1) = 8 \\)", options: ["5", "4", "3", "6"], correctOptionIndex: 0, explanation: "\\( x-1 = 4 \\rightarrow x=5 \\). Simplified Method: Divide by 2, then add 1." },
        { id: 144, text: "What is the angle of elevation of the sun if a 2m pole casts a 2m shadow?", options: ["30°", "45°", "60°", "90°"], correctOptionIndex: 1, explanation: "\\( \\tan \\theta = 2/2 = 1 \\rightarrow \\theta = 45^\\circ \\). Simplified Method: If sides are equal, angle is 45." },
        { id: 145, text: "Find the LCM of 4 and 6.", options: ["2", "12", "24", "10"], correctOptionIndex: 1, explanation: "Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... Simplified Method: Smallest number both can divide into." },
        { id: 146, text: "Simplify: $\\sqrt{50}$", options: ["$2\\sqrt{5}$", "$5\\sqrt{2}$", "$10\\sqrt{5}$", "$25\\sqrt{2}$"], correctOptionIndex: 1, explanation: "\\( \\sqrt{25 \\times 2} = 5\\sqrt{2} \\). Simplified Method: Find a square factor." },
        { id: 147, text: "The slope of a horizontal line is:", options: ["1", "0", "Undefined", "Infinite"], correctOptionIndex: 1, explanation: "No rise, only run. Simplified Method: Flat lines have zero slope." },
        { id: 148, text: "If \\( f(x) = x^2 - 1 \\), find \\( f(3) \\)", options: ["8", "5", "9", "2"], correctOptionIndex: 0, explanation: "\\( 3^2 - 1 = 8 \\). Simplified Method: Plug in 3 for x." },
        { id: 149, text: "The number of degrees in a circle is:", options: ["180°", "360°", "90°", "400°"], correctOptionIndex: 1, explanation: "Standard definition. Simplified Method: Full turn." },
        { id: 150, text: "Convert 2/5 to a percentage.", options: ["20%", "40%", "50%", "25%"], correctOptionIndex: 1, explanation: "\\( 2/5 \\times 100 = 40 \\). Simplified Method: 1/5 is 20%, so 2/5 is 40%." },
        { id: 151, text: "Solve: \\( 10 - x = 4 \\)", options: ["6", "14", "-6", "4"], correctOptionIndex: 0, explanation: "\\( 10 - 4 = 6 \\). Simplified Method: What do you take from 10 to get 4?" },
        { id: 152, text: "The range of: 5, 2, 8, 1 is:", options: ["7", "8", "4", "3"], correctOptionIndex: 0, explanation: "\\( 8 - 1 = 7 \\). Simplified Method: Highest minus Lowest." },
        { id: 153, text: "Simplify \\( a^3 \\times a^4 \\)", options: ["$a^7$", "$a^{12}$", "$a^1$", "$2a^7$"], correctOptionIndex: 0, explanation: "Add indices: \\( 3 + 4 = 7 \\). Simplified Method: Multiplying same base means adding exponents." },
        { id: 154, text: "What is the third angle of a triangle if two are 40° and 60°?", options: ["80°", "100°", "180°", "90°"], correctOptionIndex: 0, explanation: "\\( 180 - (40+60) = 80 \\). Simplified Method: Triangle sum is 180." },
        { id: 155, text: "Find the value of x: \\( x/2 + 1 = 5 \\)", options: ["8", "4", "12", "2"], correctOptionIndex: 0, explanation: "\\( x/2 = 4 \\rightarrow x=8 \\). Simplified Method: Subtract 1, then double it." },
        { id: 156, text: "A rectangle has area 50m² and length 10m. Find its width.", options: ["5m", "40m", "500m", "15m"], correctOptionIndex: 0, explanation: "\\( 50 / 10 = 5 \\). Simplified Method: Area divided by length." },
        { id: 157, text: "What is \\( 10^0 \\)?", options: ["0", "1", "10", "Undefined"], correctOptionIndex: 1, explanation: "Any non-zero number to power 0 is 1. Simplified Method: Power zero rule." },
        { id: 158, text: "Solve: \\( x^2 = 16 \\)", options: ["4 only", "$\\pm 4$", "8", "32"], correctOptionIndex: 1, explanation: "Both positive and negative 4 square to 16. Simplified Method: Roots can be plus or minus." },
        { id: 159, text: "The prime factors of 6 are:", options: ["1, 6", "2, 3", "1, 2, 3, 6", "2, 4"], correctOptionIndex: 1, explanation: "2 and 3 are prime and divide 6. Simplified Method: Prime numbers only." },
        { id: 160, text: "Find the area of a square with perimeter 20cm.", options: ["25cm²", "20cm²", "100cm²", "16cm²"], correctOptionIndex: 0, explanation: "\\( side = 20/4 = 5. Area = 5 \\times 5 = 25 \\). Simplified Method: Find side first, then square it." }
      ]
    }
  },
  [ExamType.WAEC]: {
    [Subject.ENGLISH]: {
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
