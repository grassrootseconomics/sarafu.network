import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StepProgress } from "@/components/step-progress";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { setOnboardingCompleted } = useAuth();
  const [givenNames, setGivenNames] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [locationName, setLocationName] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = trpc.me.completeOnboarding.useMutation({
    onSuccess: () => {
      setOnboardingCompleted(true);
      router.replace("/(onboarding)/offer" as Href);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function handleSubmit() {
    if (!givenNames.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    if (!familyName.trim()) {
      Alert.alert("Required", "Please enter your family name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Required", "Please enter a valid email address.");
      return;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert("Required", "Please enter your date of birth.");
      return;
    }
    if (!DATE_REGEX.test(dateOfBirth)) {
      Alert.alert("Invalid Date", "Please enter your date of birth in YYYY-MM-DD format.");
      return;
    }
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      Alert.alert("Invalid Date", "Date of birth must be a valid past date.");
      return;
    }
    if (!locationName.trim()) {
      Alert.alert("Required", "Please enter your location.");
      return;
    }

    setIsSubmitting(true);
    completeOnboarding.mutate({
      given_names: givenNames.trim(),
      family_name: familyName.trim(),
      email: email.trim(),
      date_of_birth: dob,
      location_name: locationName.trim(),
      geo: null,
      bio: bio.trim() || null,
      profile_photo_url: null,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <StepProgress steps={5} activeStep={0} />

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to get started on Sarafu Network.
          </Text>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Given Names *</Text>
                <TextInput
                  style={styles.input}
                  value={givenNames}
                  onChangeText={setGivenNames}
                  placeholder="Your given names"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Family Name *</Text>
                <TextInput
                  style={styles.input}
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder="Your family name"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={locationName}
                onChangeText={setLocationName}
                placeholder="City, Country"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell the community about yourself..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Saving..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  field: {
    gap: 6,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#f9fafb",
  },
  multiline: {
    minHeight: 80,
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
