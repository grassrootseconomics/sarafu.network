"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { DateField } from "~/components/forms/fields/date-field";
import { ImageUploadField } from "~/components/forms/fields/image-upload-field";
import { InputField } from "~/components/forms/fields/input-field";
import { MapField } from "~/components/forms/fields/map-field";
import { Loading } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { OnboardingProfileFormSchema } from "~/components/users/schemas";
import { trpc } from "~/lib/trpc";
import { type RouterOutput } from "~/server/api/root";

type OnboardingFormValues = z.infer<typeof OnboardingProfileFormSchema>;

interface ProfileStepProps {
  existingUser?: RouterOutput["me"]["get"];
  onComplete: (data: { given_names: string }) => void;
}

export function ProfileStep({ existingUser, onComplete }: ProfileStepProps) {
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(OnboardingProfileFormSchema),
    mode: "onBlur",
    defaultValues: {
      given_names: existingUser?.given_names ?? "",
      family_name: existingUser?.family_name ?? "",
      email: existingUser?.email ?? "",
      date_of_birth: existingUser?.date_of_birth
        ? new Date(existingUser.date_of_birth)
        : undefined,
      location_name: existingUser?.location_name ?? "",
      geo: existingUser?.geo ?? null,
      bio: existingUser?.bio ?? null,
      profile_photo_url: existingUser?.profile_photo_url ?? null,
    },
  });

  useEffect(() => {
    if (existingUser) {
      form.reset({
        given_names: existingUser.given_names ?? "",
        family_name: existingUser.family_name ?? "",
        email: existingUser.email ?? "",
        date_of_birth: existingUser.date_of_birth
          ? new Date(existingUser.date_of_birth)
          : undefined,
        location_name: existingUser.location_name ?? "",
        geo: existingUser.geo ?? null,
        bio: existingUser.bio ?? null,
        profile_photo_url: existingUser.profile_photo_url ?? null,
      });
    }
  }, [existingUser, form]);

  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const completeOnboarding = trpc.me.completeOnboarding.useMutation({
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auth-session"] }),
        utils.me.invalidate(),
      ]);
      onComplete({ given_names: form.getValues("given_names") });
    },
  });

  const onSubmit = (data: OnboardingFormValues) => {
    completeOnboarding.mutate(data);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground mt-2">
          Tell us a bit about yourself to get started on Sarafu Network
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo (optional) */}
          <div className="flex justify-center">
            <ImageUploadField
              form={form}
              name="profile_photo_url"
              folder="profiles"
              label="Profile Photo"
              aspectRatio={1}
              circularCrop
              description="Optional"
            />
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              form={form}
              name="given_names"
              placeholder="e.g. John"
              label="Given Names"
            />
            <InputField
              form={form}
              name="family_name"
              placeholder="e.g. Doe"
              label="Family Name"
            />
          </div>

          {/* Email */}
          <InputField
            form={form}
            name="email"
            placeholder="you@example.com"
            label="Email"
            type="email"
          />

          {/* Date of Birth */}
          <DateField
            form={form}
            name="date_of_birth"
            label="Date of Birth"
            placeholder="Select your date of birth"
            disabledDate={(date) => date > new Date() || date.getFullYear() < 1900}
            fromYear={1900}
            toYear={currentYear}
          />

          {/* Location */}
          <MapField
            form={form}
            label="Your Location"
            name="geo"
            locationName="location_name"
          />

          {/* Bio (optional) */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell the community about yourself..."
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={completeOnboarding.isPending}
              className="min-w-[200px]"
            >
              {completeOnboarding.isPending ? <Loading /> : "Continue"}
            </Button>
          </div>

          {completeOnboarding.isError && (
            <p className="text-sm text-destructive text-center">
              {completeOnboarding.error.message}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
