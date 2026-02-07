
import { Book, Question } from "../types";

export class OfflineTutorService {
  private static instance: OfflineTutorService;

  private constructor() {}

  public static getInstance(): OfflineTutorService {
    if (!OfflineTutorService.instance) {
      OfflineTutorService.instance = new OfflineTutorService();
    }
    return OfflineTutorService.instance;
  }

  public isOnline(): boolean {
    return navigator.onLine;
  }

  public getOfflineResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // 1. Try to find relevant questions from the library
    const booksRaw = localStorage.getItem('waExamPrep_books');
    if (booksRaw) {
      try {
        const books: Record<string, Book> = JSON.parse(booksRaw);
        const allQuestions: Question[] = Object.values(books).flatMap(b => b.questions);

        // Find questions that match keywords
        const keywords = lowerMessage.split(' ').filter(word => word.length > 3);
        const matches = allQuestions.filter(q => {
          const qText = q.text.toLowerCase();
          return keywords.some(k => qText.includes(k));
        });

        if (matches.length > 0) {
          const bestMatch = matches[0];
          return `I'm currently offline, but I found something relevant in your downloaded materials!

**Question**: ${bestMatch.text}
**Answer**: ${bestMatch.options[bestMatch.correctOptionIndex]}
**Explanation**: ${bestMatch.explanation}

Would you like to see more questions like this? (Connect to the internet for a full discussion!)`;
        }
      } catch (e) {
        console.error("Offline tutor failed to search library", e);
      }
    }

    // 2. Generic Educational Offline Responses
    if (lowerMessage.includes('jamb')) {
      return "I'm offline right now, but I can tell you that JAMB typically focuses on the official syllabus. Make sure you've downloaded the Mathematics and English packs for offline study!";
    }
    if (lowerMessage.includes('waec') || lowerMessage.includes('neco')) {
      return "For WAEC/NECO, practicing past questions is key. Since you're offline, try going through the packs you've already downloaded in 'Study Mode' to see detailed explanations.";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
        return "Hello! I'm your AI Tutor. I'm currently in **Offline Mode**. I can't access the internet right now, but you can still study your downloaded exam packs!";
    }

    return "I'm currently in **Offline Mode**. I can't use my full brain without the internet, but I'm still here to help! You can practice any of your downloaded exam packs while you're offline.";
  }
}

export const offlineTutor = OfflineTutorService.getInstance();
