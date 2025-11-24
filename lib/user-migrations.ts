import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  writeBatch,
  query,
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore'
import { db } from './firebase'

export interface MigrationResult {
  success: boolean
  updated: number
  errors: number
  skipped: number
  details: string[]
}

export interface UserMigration {
  id: string
  name: string
  description: string
  version: string
  execute: (userId: string, userData: any) => Promise<any>
  rollback?: (userId: string, userData: any) => Promise<any>
}

// Migration: Add cashVoucher field
export const addCashVoucherMigration: UserMigration = {
  id: 'add-cash-voucher-v1',
  name: 'Add Cash Voucher Field',
  description: 'Adds cashVoucher field to all existing users with default value of 0',
  version: '1.0.0',
  execute: async (userId: string, userData: any) => {
    // Only add if field doesn't exist
    if (userData.cashVoucher === undefined) {
      return {
        ...userData,
        cashVoucher: 0,
        updatedAt: Timestamp.now(),
        migrations: {
          ...userData.migrations,
          'add-cash-voucher-v1': {
            appliedAt: Timestamp.now(),
            version: '1.0.0'
          }
        }
      }
    }
    return null // Skip if already exists
  },
  rollback: async (userId: string, userData: any) => {
    const { cashVoucher, ...withoutCashVoucher } = userData
    return {
      ...withoutCashVoucher,
      updatedAt: Timestamp.now()
    }
  }
}

// Migration: Initialize profile completeness
export const addProfileCompletenessMigration: UserMigration = {
  id: 'add-profile-completeness-v1',
  name: 'Add Profile Completeness',
  description: 'Adds profileCompleteness field to track user profile completion',
  version: '1.0.0',
  execute: async (userId: string, userData: any) => {
    if (userData.profileCompleteness === undefined) {
      return {
        ...userData,
        profileCompleteness: {
          hasBasicInfo: !!(userData.displayName && userData.email),
          hasSubmissions: false, // Will be calculated separately
          lastUpdated: Timestamp.now()
        },
        updatedAt: Timestamp.now(),
        migrations: {
          ...userData.migrations,
          'add-profile-completeness-v1': {
            appliedAt: Timestamp.now(),
            version: '1.0.0'
          }
        }
      }
    }
    return null
  }
}

// Migration registry
export const USER_MIGRATIONS: UserMigration[] = [
  addCashVoucherMigration,
  addProfileCompletenessMigration
]

// Core migration functions
export async function runUserMigration(
  migration: UserMigration,
  options: {
    dryRun?: boolean
    batchSize?: number
    targetUserId?: string
  } = {}
): Promise<MigrationResult> {
  const { dryRun = false, batchSize = 100, targetUserId } = options
  
  console.log(`🔄 ${dryRun ? '[DRY RUN] ' : ''}Starting migration: ${migration.name}`)
  
  const result: MigrationResult = {
    success: true,
    updated: 0,
    errors: 0,
    skipped: 0,
    details: []
  }

  try {
    // Get users to migrate
    let usersQuery = collection(db, 'users')
    
    if (targetUserId) {
      // Migrate specific user
      const userDoc = await getDoc(doc(db, 'users', targetUserId))
      if (!userDoc.exists()) {
        result.details.push(`❌ User ${targetUserId} not found`)
        result.errors++
        result.success = false
        return result
      }
      
      const userData = userDoc.data()
      const updatedData = await migration.execute(targetUserId, userData)
      
      if (updatedData === null) {
        result.skipped++
        result.details.push(`⏭️ User ${targetUserId} skipped (already migrated)`)
      } else {
        if (!dryRun) {
          await updateDoc(doc(db, 'users', targetUserId), updatedData)
        }
        result.updated++
        result.details.push(`✅ User ${targetUserId} updated`)
      }
    } else {
      // Migrate all users
      const snapshot = await getDocs(usersQuery)
      const users = snapshot.docs
      
      result.details.push(`📊 Found ${users.length} users to process`)
      
      // Process in batches
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = writeBatch(db)
        const batchUsers = users.slice(i, i + batchSize)
        let batchUpdates = 0
        
        for (const userDoc of batchUsers) {
          try {
            const userId = userDoc.id
            const userData = userDoc.data()
            
            // Check if migration already applied
            if (userData.migrations?.[migration.id]) {
              result.skipped++
              continue
            }
            
            const updatedData = await migration.execute(userId, userData)
            
            if (updatedData === null) {
              result.skipped++
              continue
            }
            
            if (!dryRun) {
              batch.update(doc(db, 'users', userId), updatedData)
              batchUpdates++
            } else {
              result.details.push(`✅ [DRY RUN] Would update user ${userId}`)
            }
            
            result.updated++
          } catch (error) {
            result.errors++
            result.details.push(`❌ Error processing user ${userDoc.id}: ${error}`)
            console.error(`Error processing user ${userDoc.id}:`, error)
          }
        }
        
        // Commit batch if not dry run
        if (!dryRun && batchUpdates > 0) {
          await batch.commit()
          result.details.push(`💾 Committed batch ${Math.floor(i / batchSize) + 1} (${batchUpdates} updates)`)
        }
      }
    }
    
    result.details.push(`🎉 Migration completed: ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`)
    
  } catch (error) {
    result.success = false
    result.details.push(`💥 Migration failed: ${error}`)
    console.error('Migration failed:', error)
  }

  return result
}

export async function runAllMigrations(
  options: {
    dryRun?: boolean
    batchSize?: number
  } = {}
): Promise<Record<string, MigrationResult>> {
  const results: Record<string, MigrationResult> = {}
  
  console.log(`🚀 Running ${USER_MIGRATIONS.length} migrations...`)
  
  for (const migration of USER_MIGRATIONS) {
    results[migration.id] = await runUserMigration(migration, options)
  }
  
  return results
}

export async function rollbackMigration(
  migration: UserMigration,
  options: {
    dryRun?: boolean
    batchSize?: number
    targetUserId?: string
  } = {}
): Promise<MigrationResult> {
  if (!migration.rollback) {
    return {
      success: false,
      updated: 0,
      errors: 1,
      skipped: 0,
      details: ['❌ Migration does not support rollback']
    }
  }

  const { dryRun = false, batchSize = 100, targetUserId } = options
  
  console.log(`🔄 ${dryRun ? '[DRY RUN] ' : ''}Rolling back migration: ${migration.name}`)
  
  const result: MigrationResult = {
    success: true,
    updated: 0,
    errors: 0,
    skipped: 0,
    details: []
  }

  try {
    let usersQuery = collection(db, 'users')
    
    if (targetUserId) {
      // Rollback specific user
      const userDoc = await getDoc(doc(db, 'users', targetUserId))
      if (!userDoc.exists()) {
        result.details.push(`❌ User ${targetUserId} not found`)
        result.errors++
        result.success = false
        return result
      }
      
      const userData = userDoc.data()
      
      // Check if migration was applied
      if (!userData.migrations?.[migration.id]) {
        result.skipped++
        result.details.push(`⏭️ User ${targetUserId} skipped (migration not applied)`)
      } else {
        const rolledBackData = await migration.rollback(targetUserId, userData)
        
        // Remove migration record
        const { [migration.id]: removed, ...remainingMigrations } = userData.migrations || {}
        rolledBackData.migrations = remainingMigrations
        
        if (!dryRun) {
          await updateDoc(doc(db, 'users', targetUserId), rolledBackData)
        }
        result.updated++
        result.details.push(`✅ User ${targetUserId} rolled back`)
      }
    } else {
      // Rollback all users with this migration
      const migrationQuery = query(
        collection(db, 'users'),
        where(`migrations.${migration.id}`, '!=', null)
      )
      
      const snapshot = await getDocs(migrationQuery)
      const users = snapshot.docs
      
      result.details.push(`📊 Found ${users.length} users with migration applied`)
      
      // Process in batches
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = writeBatch(db)
        const batchUsers = users.slice(i, i + batchSize)
        let batchUpdates = 0
        
        for (const userDoc of batchUsers) {
          try {
            const userId = userDoc.id
            const userData = userDoc.data()
            
            const rolledBackData = await migration.rollback(userId, userData)
            
            // Remove migration record
            const { [migration.id]: removed, ...remainingMigrations } = userData.migrations || {}
            rolledBackData.migrations = remainingMigrations
            
            if (!dryRun) {
              batch.update(doc(db, 'users', userId), rolledBackData)
              batchUpdates++
            }
            
            result.updated++
          } catch (error) {
            result.errors++
            result.details.push(`❌ Error rolling back user ${userDoc.id}: ${error}`)
            console.error(`Error rolling back user ${userDoc.id}:`, error)
          }
        }
        
        // Commit batch if not dry run
        if (!dryRun && batchUpdates > 0) {
          await batch.commit()
          result.details.push(`💾 Committed rollback batch ${Math.floor(i / batchSize) + 1}`)
        }
      }
    }
    
    result.details.push(`🎉 Rollback completed: ${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`)
    
  } catch (error) {
    result.success = false
    result.details.push(`💥 Rollback failed: ${error}`)
    console.error('Rollback failed:', error)
  }

  return result
}

// Utility function to check user migration status
export async function getUserMigrationStatus(userId: string): Promise<{
  user: any
  appliedMigrations: string[]
  pendingMigrations: UserMigration[]
}> {
  const userDoc = await getDoc(doc(db, 'users', userId))
  
  if (!userDoc.exists()) {
    throw new Error(`User ${userId} not found`)
  }
  
  const userData = userDoc.data()
  const appliedMigrations = Object.keys(userData.migrations || {})
  const pendingMigrations = USER_MIGRATIONS.filter(
    migration => !appliedMigrations.includes(migration.id)
  )
  
  return {
    user: userData,
    appliedMigrations,
    pendingMigrations
  }
}
