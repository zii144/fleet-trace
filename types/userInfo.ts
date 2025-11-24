export interface UserInfo {
  id: string
  userId: string
  name: string
  gender: string
  genderDescription: string // for "其他" option, empty string if not applicable
  birthDate: string // YYYY-MM-DD format
  city: string
  submittedAt: string
  questionnaireId: string // "self-info-survey"
  responseId: string
  isValid: boolean
  lastUpdatedAt: string
  voucherEligible: boolean
  voucherClaimedAt?: string
  voucherAmount?: number // Amount of voucher earned
}

export interface UserInfoCache {
  [userId: string]: {
    data: UserInfo
    timestamp: number
    ttl: number
  }
}

export interface VoucherClaim {
  id: string
  userId: string
  userInfoId: string
  amount: number
  claimedAt: string
  status: 'pending' | 'approved' | 'claimed' | 'expired'
  expiresAt: string
}
