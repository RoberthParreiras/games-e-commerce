"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState("");

  async function handleSubmit(values: FormValues) {
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else if (result?.ok) {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[#393E46] p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-[#DFD0B8] font-bold mb-6 text-center">
          Login
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 text-[#222831]"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#DFD0B8]">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      required
                      className="w-full px-3 bg-[#DFD0B8] py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#DFD0B8]">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      required
                      className="w-full bg-[#DFD0B8] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="bg-[#DFD0B8] text-[#222831] h-12 w-52 hover:bg-[#cbb89d] hover:cursor-pointer"
            >
              Sign In
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
