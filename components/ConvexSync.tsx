
import React, { useEffect } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Book } from "../types";

interface ConvexSyncProps {
  userId: string | null;
  books: Record<string, Book>;
  setBooks: React.Dispatch<React.SetStateAction<Record<string, Book>>>;
}

/**
 * Separate component to handle Convex synchronization.
 * This ensures Convex hooks are only called when the ConvexProvider is present.
 */
export const ConvexSync: React.FC<ConvexSyncProps> = ({ userId, books, setBooks }) => {
  const saveBookMutation = useMutation(api.books.saveBook);
  const userProgress = useQuery(api.answers.getUserProgress, userId ? { userId } : "skip");

  // Cloud to Local Sync
  useEffect(() => {
    if (userId && userProgress && userProgress.length > 0) {
        setBooks(prev => {
            const newBooks = { ...prev };
            let changed = false;
            userProgress.forEach(p => {
                if (newBooks[p.bookId]) {
                    if ((newBooks[p.bookId].bestScore || 0) < p.bestScore) {
                        newBooks[p.bookId].bestScore = p.bestScore;
                        newBooks[p.bookId].attempts = p.attempts;
                        changed = true;
                    }
                }
            });
            if (changed) {
                localStorage.setItem('waExamPrep_books', JSON.stringify(newBooks));
                return newBooks;
            }
            return prev;
        });
    }
  }, [userId, userProgress, setBooks]);

  return null;
};
