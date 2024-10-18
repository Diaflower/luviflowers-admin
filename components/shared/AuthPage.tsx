'use client'

import React from 'react'
import { SignIn, SignUp } from "@clerk/nextjs"
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const AuthPage = ({ type }: { type: 'sign-in' | 'sign-up' }) => {
  const isSignIn = type === 'sign-in'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>
        <p className="text-sm text-gray-500 mt-2">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link href={isSignIn ? '/sign-up' : '/sign-in'} className="text-blue-600 hover:underline ml-1">
            {isSignIn ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-sm">
        {isSignIn ? (
          <SignIn routing="path" path="/sign-in" />
        ) : (
          <SignUp routing="path" path="/sign-up" />
        )}
      </div>
      <div className="text-center">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          Back to home
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default AuthPage