import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { english } from "viem/accounts";
import { useWallet } from "@/lib/wallet-context";
import { useWalletSetup } from "@/lib/wallet-setup-context";

const VERIFY_COUNT = 3;
const CHOICES_PER_QUESTION = 6;

function pickRandomIndices(total: number, count: number): number[] {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, count).sort((a, b) => a - b);
}

function getRandomWords(
  wordlist: readonly string[],
  exclude: string,
  count: number
): string[] {
  const words: string[] = [];
  while (words.length < count) {
    const w = wordlist[Math.floor(Math.random() * wordlist.length)]!;
    if (w !== exclude && !words.includes(w)) words.push(w);
  }
  return words;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export default function VerifyScreen() {
  const router = useRouter();
  const { finalizeWallet } = useWallet();
  const { pendingWallet, clear } = useWalletSetup();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const words = useMemo(
    () => pendingWallet?.mnemonic.split(" ") ?? [],
    [pendingWallet]
  );

  const questions = useMemo(() => {
    if (words.length === 0) return [];
    const indices = pickRandomIndices(words.length, VERIFY_COUNT);
    return indices.map((idx) => {
      const correct = words[idx]!;
      const decoys = getRandomWords(english, correct, CHOICES_PER_QUESTION - 1);
      return {
        wordIndex: idx,
        correct,
        choices: shuffleArray([correct, ...decoys]),
      };
    });
  }, [words]);

  useEffect(() => {
    if (!pendingWallet) {
      router.replace("/(wallet-setup)/create" as Href);
    }
  }, [pendingWallet, router]);

  if (!pendingWallet || questions.length === 0) return null;

  const question = questions[currentStep]!;

  async function handleChoice(word: string) {
    if (word !== question.correct) {
      setError("Incorrect. Try again.");
      return;
    }

    setError(null);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // All verified — persist wallet
    await finalizeWallet(
      pendingWallet!.mnemonic,
      pendingWallet!.privateKey,
      pendingWallet!.address
    );
    clear();
    router.replace("/(wallet-setup)/backup" as Href);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Your Phrase</Text>
        <Text style={styles.subtitle}>
          Select the correct word for each position to confirm you've saved your
          recovery phrase.
        </Text>
        <Text style={styles.progress}>
          {currentStep + 1} of {questions.length}
        </Text>
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>
          What is word #{question.wordIndex + 1}?
        </Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.choices}>
        {question.choices.map((word) => (
          <TouchableOpacity
            key={word}
            style={styles.choiceButton}
            onPress={() => handleChoice(word)}
          >
            <Text style={styles.choiceText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  progress: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
    marginTop: 8,
  },
  questionBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#166534",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choiceButton: {
    width: "47%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  choiceText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
});
