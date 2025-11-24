import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'

initializeApp()

interface SyncRequest {
  questionnaires: any[]
  kmlFiles: any[]
  secretKey: string
}

interface SyncResponse {
  success: boolean
  message?: string
  error?: string
  timestamp?: string
}

export const syncQuestionnaires = onRequest(
  {
    cors: true,
    region: 'us-central1', // Adjust region as needed
  },
  async (req, res) => {
    // Security check
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' })
      return
    }

    const { questionnaires, kmlFiles, secretKey } = req.body as SyncRequest
    
    if (!secretKey || secretKey !== process.env.SYNC_SECRET_KEY) {
      res.status(401).json({ success: false, error: 'Unauthorized' })
      return
    }

    if (!questionnaires || !Array.isArray(questionnaires)) {
      res.status(400).json({ success: false, error: 'Invalid questionnaires data' })
      return
    }

    if (!kmlFiles || !Array.isArray(kmlFiles)) {
      res.status(400).json({ success: false, error: 'Invalid KML files data' })
      return
    }

    const db = getFirestore()
    const batch = db.batch()
    const timestamp = new Date().toISOString()

    try {
      // Update questionnaires
      for (const questionnaire of questionnaires) {
        if (!questionnaire.id) {
          throw new Error('Questionnaire missing required id field')
        }

        const docRef = db.collection('questionnaires').doc(questionnaire.id)
        batch.set(docRef, {
          ...questionnaire,
          updatedAt: timestamp,
          syncedAt: timestamp,
          syncedFrom: 'local-config'
        }, { merge: true })
      }

      // Update KML file registry
      const kmlRef = db.collection('kml_registry').doc('files')
      batch.set(kmlRef, {
        files: kmlFiles,
        lastSyncedAt: timestamp,
        totalFiles: kmlFiles.length,
        categories: [...new Set(kmlFiles.map((kml: any) => kml.category))],
        syncedFrom: 'local-config'
      })

      // Create a sync log entry
      const logRef = db.collection('sync_logs').doc()
      batch.set(logRef, {
        timestamp,
        questionnairesCount: questionnaires.length,
        kmlFilesCount: kmlFiles.length,
        source: 'local-config',
        success: true
      })

      await batch.commit()
      
      const response: SyncResponse = {
        success: true,
        message: `Synced ${questionnaires.length} questionnaires and ${kmlFiles.length} KML files`,
        timestamp
      }

      res.json(response)
    } catch (error) {
      console.error('Sync error:', error)
      
      // Log the error
      try {
        await db.collection('sync_logs').add({
          timestamp,
          questionnairesCount: questionnaires?.length || 0,
          kmlFilesCount: kmlFiles?.length || 0,
          source: 'local-config',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      } catch (logError) {
        console.error('Failed to log error:', logError)
      }

      const response: SyncResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      res.status(500).json(response)
    }
  }
)
