'use client'

import React from 'react'
import Link from 'next/link'

const DeploymentInstructionsPage = () => {
  // Get environment status
  const isTeacherDeployed = !!process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC
  const isStudentDeployed = !!process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC
  const isQuizDeployed = !!process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC
  const isAttemptDeployed = !!process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC
  const isPaymentDeployed = !!process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC
  
  const allDeployed = isTeacherDeployed && isStudentDeployed && isQuizDeployed && isAttemptDeployed && isPaymentDeployed

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Contract Deployment Status
            </h1>
            <p className="text-lg text-gray-600">
              Your Bitcoin quiz smart contracts deployment information
            </p>
          </div>

          {/* Deployment Status */}
          <div className="mb-8">
            {allDeployed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">✅</span>
                  <div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      All Contracts Deployed Successfully!
                    </h3>
                    <p className="text-green-700">
                      Your quiz application is ready to use. All smart contracts are properly deployed and configured.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">⚠️</span>
                  <div>
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                      Some Contracts Not Deployed
                    </h3>
                    <p className="text-yellow-700">
                      Please deploy contracts using the terminal command below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current Environment Status */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              📊 Contract Deployment Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Teacher Contract:</span>
                  <span className={isTeacherDeployed ? 'text-green-600' : 'text-red-600'}>
                    {isTeacherDeployed ? '✅ Deployed' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student Contract:</span>
                  <span className={isStudentDeployed ? 'text-green-600' : 'text-red-600'}>
                    {isStudentDeployed ? '✅ Deployed' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quiz Contract:</span>
                  <span className={isQuizDeployed ? 'text-green-600' : 'text-red-600'}>
                    {isQuizDeployed ? '✅ Deployed' : '❌ Missing'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quiz Attempt Contract:</span>
                  <span className={isAttemptDeployed ? 'text-green-600' : 'text-red-600'}>
                    {isAttemptDeployed ? '✅ Deployed' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Contract:</span>
                  <span className={isPaymentDeployed ? 'text-green-600' : 'text-red-600'}>
                    {isPaymentDeployed ? '✅ Deployed' : '❌ Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!allDeployed && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔧 How to Deploy Contracts
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">1. Navigate to contracts directory:</h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                    cd packages/quiz-app/src/app/contracts
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">2. Run deployment script:</h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                    node scripts/deploy.js
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">3. Copy mod_specs to .env file:</h4>
                  <p className="text-sm text-gray-600">
                    Add the generated mod_specs to your .env.local file and restart the dev server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available mod_specs (if any) */}
          {allDeployed && (
            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📋 Deployed Contract mod_specs
              </h3>
              <div className="space-y-2 font-mono text-xs">
                <div><strong>Teacher:</strong> {process.env.NEXT_PUBLIC_TEACHER_MOD_SPEC}</div>
                <div><strong>Student:</strong> {process.env.NEXT_PUBLIC_STUDENT_MOD_SPEC}</div>
                <div><strong>Quiz:</strong> {process.env.NEXT_PUBLIC_QUIZ_MOD_SPEC}</div>
                <div><strong>Attempt:</strong> {process.env.NEXT_PUBLIC_QUIZ_ATTEMPT_MOD_SPEC}</div>
                <div><strong>Payment:</strong> {process.env.NEXT_PUBLIC_PAYMENT_MOD_SPEC}</div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🎯 Ready to Use the Platform?
            </h3>
            <p className="text-gray-600 mb-6">
              {allDeployed 
                ? "All contracts are deployed! You can now use all features of the quiz platform:"
                : "Deploy your contracts first, then you can start using the platform:"
              }
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/teacher"
                className={`inline-flex items-center px-6 py-3 ${allDeployed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg transition-colors`}
              >
                <span className="mr-2">👨‍🏫</span>
                Teacher Dashboard
              </Link>
              <Link 
                href="/student" 
                className={`inline-flex items-center px-6 py-3 ${allDeployed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-lg transition-colors`}
              >
                <span className="mr-2">🎓</span>
                Student Dashboard
              </Link>
              <Link 
                href="/wallet"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <span className="mr-2">💰</span>
                Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeploymentInstructionsPage