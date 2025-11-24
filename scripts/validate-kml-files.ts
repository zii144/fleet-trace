#!/usr/bin/env tsx

import { validateAllKMLFiles, KML_FILES } from '../lib/kml-config'

async function validateKMLFiles() {
  console.log('🔍 Validating KML files...\n')

  try {
    const validation = await validateAllKMLFiles()
    
    // Display results by category
    const categories = [...new Set(KML_FILES.map(kml => kml.category))]
    
    for (const category of categories) {
      const categoryFiles = KML_FILES.filter(kml => kml.category === category)
      const validInCategory = validation.valid.filter(kml => kml.category === category)
      const invalidInCategory = validation.invalid.filter(kml => kml.category === category)
      
      console.log(`📂 ${category.toUpperCase()} (${validInCategory.length}/${categoryFiles.length})`)
      
      validInCategory.forEach(kml => {
        console.log(`  ✅ ${kml.filename} - ${kml.name}`)
      })
      
      if (invalidInCategory.length > 0) {
        invalidInCategory.forEach(kml => {
          console.log(`  ❌ ${kml.filename} - ${kml.name} (NOT FOUND)`)
        })
      }
      
      console.log('')
    }

    // Summary
    console.log('📊 Validation Summary:')
    console.log(`  • Total files: ${validation.totalCount}`)
    console.log(`  • Valid files: ${validation.valid.length} ✅`)
    console.log(`  • Missing files: ${validation.invalid.length} ❌`)
    
    if (validation.invalid.length > 0) {
      console.log('\n⚠️  Missing files details:')
      validation.invalid.forEach(kml => {
        console.log(`  • ${kml.filename} (${kml.category}) - Expected at: ${kml.url}`)
      })
      
      console.log('\n💡 To fix missing files:')
      console.log('  1. Add the missing KML files to public/kml/')
      console.log('  2. Or remove their entries from lib/kml-config.ts')
      console.log('  3. Run this validation again')
      
      process.exit(1)
    } else {
      console.log('\n🎉 All KML files are valid and accessible!')
      process.exit(0)
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  }
}

// Run the validation
if (require.main === module) {
  validateKMLFiles().catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
}

export { validateKMLFiles }
