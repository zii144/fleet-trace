import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  getDoc,
  setDoc,
  increment,
  deleteDoc,
  getFirestore 
} from 'firebase/firestore'
import type { 
  RouteCompletionTracking, 
  RouteQuotaInfo, 
  CategoryQuotaSummary 
} from '@/types/route-submission'
import { getKMLFilesByCategory, getAllKMLFiles, getKMLFileById } from '@/lib/kml-config'

export class RouteCompletionService {
  private db: any = null

  constructor() {
    // Only initialize Firebase on client side
    if (typeof window !== 'undefined') {
      try {
        this.db = getFirestore()
      } catch (error) {
        console.warn('Firebase not initialized, using fallback mode')
      }
    }
  }

  /**
   * Get or create route completion tracking for a specific route
   */
  async getRouteCompletionTracking(
    routeId: string, 
    questionnaireId: string
  ): Promise<RouteCompletionTracking | null> {
    if (!this.db) {
      console.warn('Firebase not available, returning null')
      return null
    }
    
    try {
      const q = query(
        collection(this.db, 'route_completion_tracking'),
        where('routeId', '==', routeId),
        where('questionnaireId', '==', questionnaireId)
      )
      
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        // Create new tracking record if it doesn't exist
        const kmlFile = getKMLFileById(routeId)
        if (!kmlFile) {
          console.error(`KML file not found for route ID: ${routeId}`)
          return null
        }

        const completionLimit = this.getCompletionLimitForCategory(kmlFile.category)
        
        const newTracking: Omit<RouteCompletionTracking, 'id'> = {
          routeId,
          routeName: kmlFile.name,
          category: kmlFile.category,
          questionnaireId,
          completionLimit,
          currentCompletions: 0,
          lastUpdated: new Date().toISOString(),
          isActive: true,
          metadata: {
            totalSubmissions: 0,
            uniqueUsers: 0
          }
        }

        const docRef = await addDoc(
          collection(this.db, 'route_completion_tracking'),
          newTracking
        )

        return {
          id: docRef.id,
          ...newTracking
        }
      }

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as RouteCompletionTracking
    } catch (error) {
      console.error('Error getting route completion tracking:', error)
      return null
    }
  }

  /**
   * Increment completion count for a route
   */
  async incrementRouteCompletion(
    routeId: string, 
    questionnaireId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const tracking = await this.getRouteCompletionTracking(routeId, questionnaireId)
      if (!tracking) {
        console.error(`No tracking found for route: ${routeId}`)
        return false
      }

      // Check if route is already full
      if (tracking.currentCompletions >= tracking.completionLimit) {
        console.warn(`Route ${routeId} has reached completion limit`)
        return false
      }

      // Update the completion count
      const docRef = doc(this.db, 'route_completion_tracking', tracking.id)
      await updateDoc(docRef, {
        currentCompletions: increment(1),
        lastUpdated: new Date().toISOString(),
        'metadata.totalSubmissions': increment(1),
        'metadata.uniqueUsers': increment(1) // This should be more sophisticated in production
      })

      console.log(`✅ Incremented completion for route ${routeId}`)
      return true
    } catch (error) {
      console.error('Error incrementing route completion:', error)
      return false
    }
  }

  /**
   * Get quota information for all routes
   */
  async getAllRouteQuotas(questionnaireId: string): Promise<RouteQuotaInfo[]> {
    if (!this.db) {
      console.warn('Firebase not available, returning empty array')
      return []
    }
    
    try {
      const q = query(
        collection(this.db, 'route_completion_tracking'),
        where('questionnaireId', '==', questionnaireId),
        where('isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      const trackings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RouteCompletionTracking[]

      return trackings.map(tracking => ({
        routeId: tracking.routeId,
        routeName: tracking.routeName,
        category: tracking.category,
        completionLimit: tracking.completionLimit,
        currentCompletions: tracking.currentCompletions,
        remainingQuota: Math.max(0, tracking.completionLimit - tracking.currentCompletions),
        isFull: tracking.currentCompletions >= tracking.completionLimit,
        completionPercentage: Math.round((tracking.currentCompletions / tracking.completionLimit) * 100)
      }))
    } catch (error) {
      console.error('Error getting route quotas:', error)
      return []
    }
  }

  /**
   * Get all route quotas for admin management (no filtering)
   */
  async getAllRouteQuotasForAdmin(): Promise<RouteQuotaInfo[]> {
    if (!this.db) {
      console.warn('Firebase not available, returning empty array')
      return []
    }
    
    try {
      const q = query(collection(this.db, 'route_completion_tracking'))
      
      const snapshot = await getDocs(q)
      const trackings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RouteCompletionTracking[]

      return trackings.map(tracking => ({
        id: tracking.id,
        routeId: tracking.routeId,
        routeName: tracking.routeName,
        category: tracking.category,
        questionnaireId: tracking.questionnaireId,
        completionLimit: tracking.completionLimit,
        currentCompletions: tracking.currentCompletions,
        remainingQuota: Math.max(0, tracking.completionLimit - tracking.currentCompletions),
        isFull: tracking.currentCompletions >= tracking.completionLimit,
        completionPercentage: Math.round((tracking.currentCompletions / tracking.completionLimit) * 100),
        isActive: tracking.isActive,
        lastUpdated: tracking.lastUpdated,
        metadata: tracking.metadata
      }))
    } catch (error) {
      console.error('Error getting all route quotas for admin:', error)
      return []
    }
  }

  /**
   * Get quota summary by category
   */
  async getCategoryQuotaSummary(questionnaireId: string): Promise<CategoryQuotaSummary[]> {
    if (!this.db) {
      console.warn('Firebase not available, returning empty array')
      return []
    }
    
    try {
      const routeQuotas = await this.getAllRouteQuotas(questionnaireId)
      
      // Group by category
      const categoryMap = new Map<string, RouteQuotaInfo[]>()
      
      routeQuotas.forEach(quota => {
        if (!categoryMap.has(quota.category)) {
          categoryMap.set(quota.category, [])
        }
        categoryMap.get(quota.category)!.push(quota)
      })

      return Array.from(categoryMap.entries()).map(([category, routes]) => {
        const totalRoutes = routes.length
        const totalLimit = routes.reduce((sum, route) => sum + route.completionLimit, 0)
        const totalCompletions = routes.reduce((sum, route) => sum + route.currentCompletions, 0)
        const totalRemaining = totalLimit - totalCompletions

        return {
          category,
          categoryName: this.getCategoryDisplayName(category),
          totalRoutes,
          totalLimit,
          totalCompletions,
          totalRemaining,
          routes
        }
      })
    } catch (error) {
      console.error('Error getting category quota summary:', error)
      return []
    }
  }

  /**
   * Check if a route has reached its completion limit
   */
  async isRouteFull(routeId: string, questionnaireId: string): Promise<boolean> {
    try {
      const tracking = await this.getRouteCompletionTracking(routeId, questionnaireId)
      return tracking ? tracking.currentCompletions >= tracking.completionLimit : false
    } catch (error) {
      console.error('Error checking if route is full:', error)
      return false
    }
  }

  /**
   * Get remaining quota for a specific route
   */
  async getRouteRemainingQuota(routeId: string, questionnaireId: string): Promise<number> {
    try {
      const tracking = await this.getRouteCompletionTracking(routeId, questionnaireId)
      if (!tracking) return 0
      
      return Math.max(0, tracking.completionLimit - tracking.currentCompletions)
    } catch (error) {
      console.error('Error getting route remaining quota:', error)
      return 0
    }
  }

  /**
   * Initialize completion tracking for all routes in a questionnaire
   */
  async initializeQuestionnaireTracking(questionnaireId: string): Promise<void> {
    try {
      const allRoutes = getAllKMLFiles()
      
      for (const route of allRoutes) {
        await this.getRouteCompletionTracking(route.id, questionnaireId)
      }
      
      console.log(`✅ Initialized tracking for ${allRoutes.length} routes`)
    } catch (error) {
      console.error('Error initializing questionnaire tracking:', error)
    }
  }

  /**
   * Get completion limit for a category based on business rules
   */
  private getCompletionLimitForCategory(category: string): number {
    switch (category) {
      case 'round-island-main':
        return 70 // 環島自行車路線（環島1號）兌換名額度
      case 'round-island':
        return 35 // 環島自行車路線（環支線每條35份）
      case 'round-island-alternative':
        return 35 // 環島自行車路線（替代路線每條35份）
      case 'diverse':
        return 40 // 多元自行車路線（每條40份）
      default:
        return 30 // Default limit for other categories
    }
  }

  /**
   * Update route completion tracking
   */
  async updateRouteCompletionTracking(tracking: RouteCompletionTracking): Promise<boolean> {
    try {
      const docRef = doc(this.db, 'route_completion_tracking', tracking.id)
      
      const updateData = {
        routeId: tracking.routeId,
        routeName: tracking.routeName,
        category: tracking.category,
        questionnaireId: tracking.questionnaireId,
        completionLimit: tracking.completionLimit,
        currentCompletions: tracking.currentCompletions,
        lastUpdated: new Date().toISOString(),
        isActive: tracking.isActive,
        metadata: tracking.metadata
      }
      
      await updateDoc(docRef, updateData)
      console.log(`✅ Updated tracking for ${tracking.routeName}`)
      return true
    } catch (error) {
      console.error('Error updating route completion tracking:', error)
      return false
    }
  }

  /**
   * Delete route completion tracking
   */
  async deleteRouteCompletionTracking(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.db, 'route_completion_tracking', id)
      await deleteDoc(docRef)
      console.log(`✅ Deleted tracking record ${id}`)
      return true
    } catch (error) {
      console.error('Error deleting route completion tracking:', error)
      return false
    }
  }

  /**
   * Get display name for category
   */
  private getCategoryDisplayName(category: string): string {
    switch (category) {
      case 'round-island-main':
        return '環島自行車路線（環島1號）'
      case 'round-island':
        return '環島自行車路線（環支線）'
      case 'round-island-alternative':
        return '環島自行車路線（替代路線）'
      case 'diverse':
        return '多元自行車路線'
      case 'scenic':
        return '風景路線'
      case 'custom':
        return '自訂路線'
      default:
        return category
    }
  }
}

// Export singleton instance
export const routeCompletionService = new RouteCompletionService()
export default routeCompletionService 