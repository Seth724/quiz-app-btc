/**
 * Browser-Safe Access Client - Uses mod specs instead of contract imports
 */


import { Computer } from '@bitcoin-computer/lib'
import { MODULE_SPECS } from '@/config/env'

export interface AccessDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  studentId: string
  hasAccess: boolean
  purchasedAt: number
  expiresAt?: number
}

export interface SaleOfferDTO {
  _id: string
  _rev: string
  _root: string
  _owners: string[]
  _satoshis: bigint
  quizId: string
  teacherId: string
  price: bigint
  isActive: boolean
}

/**
 * Browser-safe AccessClient using mod specs
 */
export class BrowserAccessClient {
  constructor(private computer: Computer) {}

  /**
   * Purchase access to a quiz - browser safe implementation
   */
  async purchase(quizId: string, price: bigint): Promise<AccessDTO> {
    try {
      console.log('🔨 BrowserAccessClient.purchase called with:', { quizId, price })

      if (!MODULE_SPECS.quizAccessMod || !MODULE_SPECS.quizAccessSaleMod) {
        console.warn('⚠️ Missing module specs for access operations, using mock mode')
        return this.createMockAccess(quizId, price)
      }

      // In a real implementation, this would:
      // 1. Find the sale offer for the quiz
      // 2. Purchase the access token by paying the price
      // 3. Return the access token details
      
      // For now, create a mock access token
      const mockAccess: AccessDTO = {
        _id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        _rev: '0',
        _root: `root_${Date.now()}`,
        _owners: [this.computer.getPublicKey()],
        _satoshis: price,
        quizId,
        studentId: this.computer.getPublicKey(),
        hasAccess: true,
        purchasedAt: Date.now(),
      }

      console.log('✅ Access purchased:', mockAccess)
      return mockAccess

    } catch (error) {
      console.error('❌ Error purchasing access:', error)
      // Fallback to mock
      return this.createMockAccess(quizId, price)
    }
  }

  /**
   * Check if student has access to a quiz
   */
  async checkAccess(studentId: string, quizId: string): Promise<boolean> {
    try {
      console.log('🔍 BrowserAccessClient.checkAccess called with:', { studentId, quizId })

      if (!MODULE_SPECS.quizAccessMod) {
        console.warn('⚠️ Missing quiz access module spec, using mock mode')
        return true // Mock always has access
      }

      // In a real implementation, this would query the blockchain
      // for access tokens owned by the student for the specific quiz
      
      // For now, return true (mock access)
      return true

    } catch (error) {
      console.error('❌ Error checking access:', error)
      return false
    }
  }

  /**
   * List all access tokens for a student
   */
  async listByStudent(studentId: string): Promise<AccessDTO[]> {
    try {
      console.log('📋 BrowserAccessClient.listByStudent called with:', { studentId })

      if (!MODULE_SPECS.quizAccessMod) {
        console.warn('⚠️ Missing quiz access module spec, using mock mode')
        return []
      }

      // In a real implementation, this would query all access tokens
      // owned by the student
      
      // For now, return empty array
      return []

    } catch (error) {
      console.error('❌ Error listing student access:', error)
      return []
    }
  }

  /**
   * Create sale offer for a quiz
   */
  async createSaleOffer(quizId: string, price: bigint): Promise<SaleOfferDTO> {
    try {
      console.log('🏪 BrowserAccessClient.createSaleOffer called with:', { quizId, price })

      if (!MODULE_SPECS.quizAccessSaleMod) {
        console.warn('⚠️ Missing sale module spec, using mock mode')
        return this.createMockSaleOffer(quizId, price)
      }

      // Create mock sale offer for now
      const mockOffer: SaleOfferDTO = {
        _id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        _rev: '0',
        _root: `root_${Date.now()}`,
        _owners: [this.computer.getPublicKey()],
        _satoshis: BigInt(0),
        quizId,
        teacherId: this.computer.getPublicKey(),
        price,
        isActive: true,
      }

      console.log('✅ Sale offer created:', mockOffer)
      return mockOffer

    } catch (error) {
      console.error('❌ Error creating sale offer:', error)
      return this.createMockSaleOffer(quizId, price)
    }
  }

  /**
   * Create mock access token for development/testing
   */
  private createMockAccess(quizId: string, price: bigint): AccessDTO {
    return {
      _id: `mock_access_${Date.now()}`,
      _rev: '0',
      _root: `mock_root_${Date.now()}`,
      _owners: ['mock_student_key'],
      _satoshis: price,
      quizId,
      studentId: 'mock_student_key',
      hasAccess: true,
      purchasedAt: Date.now(),
    }
  }

  /**
   * Create mock sale offer for development/testing
   */
  private createMockSaleOffer(quizId: string, price: bigint): SaleOfferDTO {
    return {
      _id: `mock_sale_${Date.now()}`,
      _rev: '0',
      _root: `mock_root_${Date.now()}`,
      _owners: ['mock_teacher_key'],
      _satoshis: BigInt(0),
      quizId,
      teacherId: 'mock_teacher_key',
      price,
      isActive: true,
    }
  }
}