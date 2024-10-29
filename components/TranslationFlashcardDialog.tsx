// components/TranslationFlashcardDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { languageMapping } from '@/lib/huggingface';

const formSchema = z.object({
  text: z.string().min(1, "Text is required").max(500, "Text too long"),
  sourceLang: z.string().min(1, "Source language is required"),
  targetLang: z.string().min(1, "Target language is required")
});

type FormData = z.infer<typeof formSchema>;

interface TranslationFlashcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
  onFlashcardCreated: () => void;
}

export default function TranslationFlashcardDialog({
  open,
  onOpenChange,
  deckId,
  onFlashcardCreated
}: TranslationFlashcardDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      sourceLang: 'en',
      targetLang: 'de'
    }
  });

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    try {
      // First, get the translation
      const translationResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: values.text,
          sourceLang: values.sourceLang,
          targetLang: values.targetLang
        }),
      });

      if (!translationResponse.ok) {
        const error = await translationResponse.json();
        throw new Error(error.error || 'Translation failed');
      }

      const { source, target } = await translationResponse.json();

      // Then, create the flashcard
      const flashcardResponse = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          front: source,
          back: target
        }),
      });

      if (!flashcardResponse.ok) {
        const error = await flashcardResponse.json();
        console.error('Flashcard creation error:', await flashcardResponse.text());
        throw new Error(error.error || 'Failed to create flashcard');
      }

      toast({
        title: "Success",
        description: "Translation flashcard created successfully",
      });

      form.reset();
      onFlashcardCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating translation flashcard:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create flashcard',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark:glass-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-light dark:text-white">
            Create Translation Flashcard
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-neutral-200">Word or Phrase</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter word or phrase to translate"
                      className="dark:bg-white/5 dark:border-white/10 dark:text-white"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceLang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-neutral-200">Source Language</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                        <SelectValue placeholder="Select source language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(languageMapping).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetLang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-neutral-200">Target Language</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-white/5 dark:border-white/10 dark:text-white">
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(languageMapping).map(([code, name]) => (
                        <SelectItem key={code} value={code}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Translation...
                </>
              ) : (
                'Create Flashcard'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}