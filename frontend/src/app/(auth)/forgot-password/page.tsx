'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { authApi } from '@/src/lib/api';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.logout(); // placeholder — replace with authApi.requestPasswordReset(data.email)
      setSentEmail(data.email);
      setSent(true);
    } catch {
      setSentEmail(data.email);
      setSent(true); // Always show success to prevent email enumeration
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-eco-50 to-white px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-600 rounded-md" aria-label="CarbonWise AI home">
            <Leaf className="h-8 w-8 text-eco-600" aria-hidden="true" />
            <span className="text-xl font-bold text-gray-900">CarbonWise AI</span>
          </Link>
        </div>

        <Card>
          {sent ? (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-eco-100">
                  <CheckCircle2 className="h-6 w-6 text-eco-600" aria-hidden="true" />
                </div>
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  If an account exists for <strong>{sentEmail}</strong>, we&apos;ve sent a password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    className="text-eco-600 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-eco-600 rounded"
                    onClick={() => setSent(false)}
                  >
                    try again
                  </button>.
                </p>
                <Button variant="eco" className="w-full" asChild>
                  <Link href="/login">Back to sign in</Link>
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-eco-100">
                  <Mail className="h-6 w-6 text-eco-600" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl text-center">Forgot your password?</CardTitle>
                <CardDescription className="text-center">
                  Enter your email and we&apos;ll send you a reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      aria-invalid={!!errors.email}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-red-600" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" variant="eco" className="w-full" loading={isSubmitting}>
                    Send reset link
                  </Button>
                </form>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-eco-600 rounded"
                  >
                    <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
