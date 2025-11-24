#!/usr/bin/env tsx

import { KML_FILES, validateAllKMLFiles } from '../lib/kml-config'
import { getDefaultQuestionnaires } from '../lib/questionnaire'

async function syncToFirebase() {
  console.log('🔍 Starting questionnaire sync process...\n')

  const CLOUD_FUNCTION_URL = process.env.SYNC_CLOUD_FUNCTION_URL
  const SECRET_KEY = process.env.SYNC_SECRET_KEY

  if (!CLOUD_FUNCTION_URL || !SECRET_KEY) {
    console.error('❌ Missing environment variables:')
    console.error('  SYNC_CLOUD_FUNCTION_URL:', !!CLOUD_FUNCTION_URL ? '✓' : '✗')
    console.error('  SYNC_SECRET_KEY:', !!SECRET_KEY ? '✓' : '✗')
    console.error('\nPlease set these variables in your .env.local file')
    process.exit(1)
  }

  try {
    // Get current questionnaires with dynamic KML configuration
    const questionnaires = getDefaultQuestionnaires()
    
    console.log(`📋 Generated questionnaires with current KML data:`)
    questionnaires.forEach(q => {
      const mapQuestion = q.sections.find(s => s.questions.find(qu => qu.type === 'map'))?.questions.find(qu => qu.type === 'map')
      const kmlCount = (mapQuestion as any)?.kmlFiles?.length || 0
      console.log(`  • ${q.title}: ${kmlCount} KML files`)
    })
    // Step 1: Validate all KML files
    console.log('📁 Validating KML files...')
    const validation = await validateAllKMLFiles()
    
    // Display validation results
    validation.valid.forEach(kml => {
      console.log(`  ✅ ${kml.filename}`)
    })
    
    if (validation.invalid.length > 0) {
      console.log('\n⚠️  Missing KML files:')
      validation.invalid.forEach(kml => {
        console.log(`  ❌ ${kml.filename} - NOT FOUND`)
      })
      console.log('\nℹ️  Note: Missing files will not break the sync, but may cause issues in production.')
      
      // Ask user if they want to continue
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise<string>((resolve) => {
        readline.question('Continue with sync? (y/N): ', resolve)
      })
      
      readline.close()
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Sync cancelled by user')
        process.exit(0)
      }
    }

    console.log(`\n📊 Validation Summary:`)
    console.log(`  • Total files: ${validation.totalCount}`)
    console.log(`  • Valid files: ${validation.valid.length}`)
    console.log(`  • Missing files: ${validation.invalid.length}`)

    // Step 2: Sync to Firebase
    console.log('\n🚀 Syncing to Firebase...')
    console.log(`  • Endpoint: ${CLOUD_FUNCTION_URL}`)
    console.log(`  • Questionnaires: ${questionnaires.length}`)
    console.log(`  • KML files: ${KML_FILES.length}`)

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionnaires,
        kmlFiles: KML_FILES,
        secretKey: SECRET_KEY
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || result.message || 'Unknown error'}`)
    }

    if (result.success) {
      console.log('\n✅ Sync completed successfully!')
      console.log(`  • Timestamp: ${result.timestamp}`)
      console.log(`  • Message: ${result.message}`)
      console.log('\n🎉 Ready for deployment!')
    } else {
      throw new Error(result.error || 'Unknown sync error')
    }

  } catch (error) {
    console.error('\n❌ Sync failed:', error.message)
    
    if (error.message.includes('401')) {
      console.error('\n💡 Possible solutions:')
      console.error('  1. Check your SYNC_SECRET_KEY in .env.local')
      console.error('  2. Verify the cloud function is deployed')
      console.error('  3. Ensure the secret key matches the function configuration')
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('fetch')) {
      console.error('\n💡 Possible solutions:')
      console.error('  1. Check your SYNC_CLOUD_FUNCTION_URL')
      console.error('  2. Verify you have internet connection')
      console.error('  3. Ensure the cloud function is deployed and accessible')
    }
    
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Sync interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Sync terminated')
  process.exit(0)
})

// Run the sync
if (require.main === module) {
  syncToFirebase().catch((error) => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })
}

export { syncToFirebase }
