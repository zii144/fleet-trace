import { 
  runUserMigration, 
  runAllMigrations, 
  rollbackMigration,
  getUserMigrationStatus,
  USER_MIGRATIONS,
  addCashVoucherMigration
} from '../lib/user-migrations'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  console.log('🚀 User Migration Tool')
  console.log('=====================\n')
  
  switch (command) {
    case 'list':
      console.log('Available migrations:')
      USER_MIGRATIONS.forEach((migration, index) => {
        console.log(`${index + 1}. ${migration.name} (${migration.id})`)
        console.log(`   Description: ${migration.description}`)
        console.log(`   Version: ${migration.version}\n`)
      })
      break
      
    case 'run':
      const migrationId = args[1]
      const dryRun = args.includes('--dry-run')
      const targetUserId = args.find(arg => arg.startsWith('--user='))?.split('=')[1]
      
      if (!migrationId) {
        console.log('❌ Please specify migration ID')
        console.log('Usage: npm run migrate-users run <migration-id> [--dry-run] [--user=userId]')
        return
      }
      
      const migration = USER_MIGRATIONS.find(m => m.id === migrationId)
      if (!migration) {
        console.log(`❌ Migration ${migrationId} not found`)
        return
      }
      
      const result = await runUserMigration(migration, { 
        dryRun, 
        targetUserId 
      })
      
      console.log('\n📊 Migration Results:')
      console.log(`Success: ${result.success}`)
      console.log(`Updated: ${result.updated}`)
      console.log(`Skipped: ${result.skipped}`)
      console.log(`Errors: ${result.errors}`)
      console.log('\nDetails:')
      result.details.forEach((detail: string) => console.log(detail))
      break
      
    case 'run-all':
      const dryRunAll = args.includes('--dry-run')
      
      const results = await runAllMigrations({ dryRun: dryRunAll })
      
      console.log('\n📊 All Migrations Results:')
      Object.entries(results).forEach(([migrationId, result]) => {
        console.log(`\n${migrationId}:`)
        console.log(`  Updated: ${result.updated}`)
        console.log(`  Skipped: ${result.skipped}`)
        console.log(`  Errors: ${result.errors}`)
        console.log(`  Success: ${result.success}`)
      })
      break
      
    case 'rollback':
      const rollbackMigrationId = args[1]
      const dryRunRollback = args.includes('--dry-run')
      const targetUserIdRollback = args.find(arg => arg.startsWith('--user='))?.split('=')[1]
      
      if (!rollbackMigrationId) {
        console.log('❌ Please specify migration ID to rollback')
        console.log('Usage: npm run migrate-users rollback <migration-id> [--dry-run] [--user=userId]')
        return
      }
      
      const rollbackMigration = USER_MIGRATIONS.find(m => m.id === rollbackMigrationId)
      if (!rollbackMigration) {
        console.log(`❌ Migration ${rollbackMigrationId} not found`)
        return
      }
      
      const rollbackResult = await rollbackMigration(rollbackMigration, {
        dryRun: dryRunRollback,
        targetUserId: targetUserIdRollback
      })
      
      console.log('\n📊 Rollback Results:')
      console.log(`Success: ${rollbackResult.success}`)
      console.log(`Updated: ${rollbackResult.updated}`)
      console.log(`Skipped: ${rollbackResult.skipped}`)
      console.log(`Errors: ${rollbackResult.errors}`)
      console.log('\nDetails:')
      rollbackResult.details.forEach((detail: string) => console.log(detail))
      break
      
    case 'status':
      const statusUserId = args[1]
      
      if (!statusUserId) {
        console.log('❌ Please specify user ID')
        console.log('Usage: npm run migrate-users status <user-id>')
        return
      }
      
      try {
        const status = await getUserMigrationStatus(statusUserId)
        
        console.log(`📋 Migration status for user: ${statusUserId}`)
        console.log(`Applied migrations: ${status.appliedMigrations.length}`)
        status.appliedMigrations.forEach(id => console.log(`  ✅ ${id}`))
        
        console.log(`\nPending migrations: ${status.pendingMigrations.length}`)
        status.pendingMigrations.forEach(migration => console.log(`  ⏳ ${migration.id} - ${migration.name}`))
        
      } catch (error) {
        console.log(`❌ Error getting status: ${error}`)
      }
      break
      
    case 'add-cash-voucher':
      // Quick command for adding cash voucher
      const dryRunCash = args.includes('--dry-run')
      const targetUserIdCash = args.find(arg => arg.startsWith('--user='))?.split('=')[1]
      
      console.log('💰 Adding cashVoucher field to users...')
      
      const cashResult = await runUserMigration(addCashVoucherMigration, {
        dryRun: dryRunCash,
        targetUserId: targetUserIdCash
      })
      
      console.log('\n📊 Cash Voucher Migration Results:')
      console.log(`Success: ${cashResult.success}`)
      console.log(`Updated: ${cashResult.updated}`)
      console.log(`Skipped: ${cashResult.skipped}`)
      console.log(`Errors: ${cashResult.errors}`)
      console.log('\nDetails:')
      cashResult.details.forEach((detail: string) => console.log(detail))
      break
      
    default:
      console.log('Available commands:')
      console.log('  list                              - List all available migrations')
      console.log('  run <migration-id> [--dry-run] [--user=userId] - Run specific migration')
      console.log('  run-all [--dry-run]              - Run all pending migrations')
      console.log('  rollback <migration-id> [--dry-run] [--user=userId] - Rollback migration')
      console.log('  status <user-id>                 - Check migration status for user')
      console.log('  add-cash-voucher [--dry-run] [--user=userId] - Quick add cashVoucher field')
      console.log('\nOptions:')
      console.log('  --dry-run                        - Preview changes without applying')
      console.log('  --user=userId                    - Target specific user')
      break
  }
}

// Handle errors gracefully
main().catch(error => {
  console.error('💥 Migration failed:', error)
  process.exit(1)
})
