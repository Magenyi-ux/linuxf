export const createExternalAiSession = (initialContext?: string) => {
  const history: { role: "user" | "assistant"; content: string }[] = [];

  return {
    sendMessage: async (message: string, imageBase64?: string) => {
      const promptParts = [
        "Help a Nigerian student prepare for WAEC, JAMB, or NECO.",
        "Explain clearly, use simple step-by-step reasoning, and focus on teaching rather than only giving an answer."
      ];

      if (initialContext) {
        promptParts.push(`Question/context from Examply: ${initialContext}`);
      }

      const previousMessages = history
        .slice(-8)
        .map((item) => `${item.role === "user" ? "Student" : "AI Assistant"}: ${item.content}`)
        .filter(Boolean);

      if (previousMessages.length > 0) {
        promptParts.push("Relevant conversation context:", previousMessages.join("\n"));
      }

      promptParts.push(`Student's new question: ${message}`);

      if (imageBase64) {
        promptParts.push(
          "The student attached an image in Examply. Ask them to attach the same image in the external AI service because the browser handoff cannot transfer the image automatically."
        );
      }

      const prompt = promptParts.join("\n\n");

      if (typeof window !== "undefined") {
        window.open("https://gemini.google.com/app", "_blank", "noopener,noreferrer");
      }

      let copied = false;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(prompt);
          copied = true;
        } catch (error) {
          console.warn("Could not copy the AI prompt to the clipboard:", error);
        }
      }

      history.push({ role: "user", content: message });

      const responseText = copied
        ? "Gemini was opened in a new browser tab. The prepared prompt is copied—paste it into Gemini to continue."
        : "Gemini was opened in a new browser tab. Copy your question into Gemini to continue.";

      history.push({ role: "assistant", content: responseText });

      return {
        response: {
          text: () => responseText
        }
      };
    }
  };
};
