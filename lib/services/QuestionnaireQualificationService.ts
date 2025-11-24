import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export interface QualificationStatus {
  isQualified: boolean;
  missingPrerequisites: string[];
  completedPrerequisites: string[];
  isDisabled?: boolean; // New field to indicate if questionnaire should be disabled
  disableReason?: string; // Reason for being disabled
  emailVerified?: boolean; // Email verification status
}

export interface QuestionnaireQualification {
  id: string;
  title: string;
  prerequisites: string[];
  disableWhenCompleted?: boolean; // New field to indicate if questionnaire should be disabled
  requiresEmailVerification?: boolean; // Whether this questionnaire requires email verification
}

export class QuestionnaireQualificationService {
  private static instance: QuestionnaireQualificationService;

  // Define qualification requirements
  private readonly QUALIFICATION_RULES: QuestionnaireQualification[] = [
    {
      id: "cycling-survey-2025",
      title: "「多元自行車路線」使用情形及滿意度問卷",
      prerequisites: ["self-info-survey"],
      requiresEmailVerification: true,
    },
    {
      id: "diverse-cycling-survey-2025",
      title: "「環島自行車路線」使用情形及滿意度問卷",
      prerequisites: ["self-info-survey"],
      requiresEmailVerification: true,
    },
    {
      id: "self-info-survey",
      title: "使用者基本資料收集問卷",
      prerequisites: [],
      disableWhenCompleted: true, // This questionnaire should be disabled when completed
      requiresEmailVerification: true,
    },
    {
      id: "taipei-taxi-service-quality-survey",
      title: "臺北市計程車服務品質評鑑調查",
      prerequisites: [],
      requiresEmailVerification: true,
    },
    {
      id: "new-taipei-taxi-service-quality-survey",
      title: "新北市計程車服務品質評鑑調查",
      prerequisites: ["self-info-survey"],
      requiresEmailVerification: true,
    },
    {
      id: "taoyuan-taxi-service-quality-survey",
      title: "桃園市計程車服務品質評鑑調查",
      prerequisites: ["self-info-survey"],
      requiresEmailVerification: true,
    },
    {
      id: "taichung-taxi-service-quality-survey",
      title: "臺中市計程車服務品質評鑑調查",
      prerequisites: ["self-info-survey"],
      requiresEmailVerification: true,
    },
    {
      id: "kaohsiung-taxi-service-quality-survey",
      title: "高雄市計程車服務品質評鑑調查",
      prerequisites: ["self-info-survey"],
      requiresEmailVerification: true,
    },
  ];

  // Map questionnaire IDs to human-readable names
  private readonly QUESTIONNAIRE_NAMES: Record<string, string> = {
    "self-info-survey": "使用者基本資料收集問卷",
    "cycling-survey-2025": "「多元自行車路線」使用情形及滿意度問卷",
    "diverse-cycling-survey-2025": "「環島自行車路線」使用情形及滿意度問卷",
    "taipei-taxi-service-quality-survey": "臺北市計程車服務品質評鑑調查",
    "new-taipei-taxi-service-quality-survey": "新北市計程車服務品質評鑑調查",
    "taoyuan-taxi-service-quality-survey": "桃園市計程車服務品質評鑑調查",
    "taichung-taxi-service-quality-survey": "臺中市計程車服務品質評鑑調查",
    "kaohsiung-taxi-service-quality-survey": "高雄市計程車服務品質評鑑調查",
  };

  static getInstance(): QuestionnaireQualificationService {
    if (!QuestionnaireQualificationService.instance) {
      QuestionnaireQualificationService.instance =
        new QuestionnaireQualificationService();
    }
    return QuestionnaireQualificationService.instance;
  }

  /**
   * Check if user is qualified for a specific questionnaire
   */
  async checkQualification(
    userId: string,
    questionnaireId: string,
    emailVerified: boolean = false
  ): Promise<QualificationStatus> {
    try {
      console.log(
        `🔍 Checking qualification for user ${userId} and questionnaire ${questionnaireId}`
      );
      console.log(`📧 Email verification status: ${emailVerified}`);

      const qualificationRule = this.QUALIFICATION_RULES.find(
        (rule) => rule.id === questionnaireId
      );

      // If no qualification rule exists, user is automatically qualified
      if (!qualificationRule) {
        return {
          isQualified: true,
          missingPrerequisites: [],
          completedPrerequisites: [],
          isDisabled: false,
          emailVerified: true,
        };
      }

      // Check email verification requirement first
      const requiresEmailVerification =
        qualificationRule.requiresEmailVerification || false;
      if (requiresEmailVerification && !emailVerified) {
        console.log(`❌ Email verification required but not verified`);
        return {
          isQualified: false,
          missingPrerequisites: ["email-verification"],
          completedPrerequisites: [],
          isDisabled: false,
          emailVerified: false,
        };
      }

      // Get user's completed questionnaires
      const completedQuestionnaires = await this.getUserCompletedQuestionnaires(
        userId
      );
      console.log(`📋 User completed questionnaires:`, completedQuestionnaires);

      // Check if this questionnaire should be disabled when completed
      const isCompleted = completedQuestionnaires.includes(questionnaireId);
      const shouldDisableWhenCompleted =
        qualificationRule.disableWhenCompleted || false;
      const isDisabled = isCompleted && shouldDisableWhenCompleted;

      // Check which prerequisites are completed
      const completedPrerequisites = qualificationRule.prerequisites.filter(
        (prereq) => completedQuestionnaires.includes(prereq)
      );

      const missingPrerequisites = qualificationRule.prerequisites.filter(
        (prereq) => !completedQuestionnaires.includes(prereq)
      );

      const isQualified = missingPrerequisites.length === 0;

      console.log(`✅ Qualification check result:`, {
        isQualified,
        completedPrerequisites,
        missingPrerequisites,
        isDisabled,
        disableReason: isDisabled ? "已完成此問卷" : undefined,
        emailVerified,
      });

      return {
        isQualified,
        missingPrerequisites,
        completedPrerequisites,
        isDisabled,
        disableReason: isDisabled ? "已完成此問卷" : undefined,
        emailVerified,
      };
    } catch (error) {
      console.error(`❌ Error checking qualification:`, error);
      // In case of error, return not qualified to be safe
      return {
        isQualified: false,
        missingPrerequisites: [],
        completedPrerequisites: [],
        isDisabled: false,
        emailVerified: false,
      };
    }
  }

  /**
   * Get all questionnaires that user has completed
   */
  private async getUserCompletedQuestionnaires(
    userId: string
  ): Promise<string[]> {
    try {
      const responsesQuery = query(
        collection(db, "questionnaire_responses"),
        where("userId", "==", userId),
        where("status", "==", "completed")
      );

      const querySnapshot = await getDocs(responsesQuery);
      const completedQuestionnaires: string[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.questionnaireId) {
          completedQuestionnaires.push(data.questionnaireId);
        }
      });

      // Remove duplicates
      return [...new Set(completedQuestionnaires)];
    } catch (error) {
      console.error(`❌ Error fetching completed questionnaires:`, error);
      return [];
    }
  }

  /**
   * Check qualifications for multiple questionnaires at once
   */
  async checkMultipleQualifications(
    userId: string,
    questionnaireIds: string[],
    emailVerified: boolean = false
  ): Promise<Record<string, QualificationStatus>> {
    try {
      const results: Record<string, QualificationStatus> = {};

      // Process all qualification checks in parallel
      const qualificationPromises = questionnaireIds.map(async (id) => {
        const status = await this.checkQualification(userId, id, emailVerified);
        return { id, status };
      });

      const qualificationResults = await Promise.all(qualificationPromises);

      qualificationResults.forEach(({ id, status }) => {
        results[id] = status;
      });

      return results;
    } catch (error) {
      console.error(`❌ Error checking multiple qualifications:`, error);
      return {};
    }
  }

  /**
   * Get human-readable name for questionnaire ID
   */
  getQuestionnaireName(questionnaireId: string): string {
    return this.QUESTIONNAIRE_NAMES[questionnaireId] || questionnaireId;
  }

  /**
   * Get all qualification rules
   */
  getQualificationRules(): QuestionnaireQualification[] {
    return [...this.QUALIFICATION_RULES];
  }

  /**
   * Check if questionnaire has prerequisites
   */
  hasPrerequisites(questionnaireId: string): boolean {
    const rule = this.QUALIFICATION_RULES.find(
      (rule) => rule.id === questionnaireId
    );
    return rule ? rule.prerequisites.length > 0 : false;
  }

  /**
   * Check if questionnaire should be disabled when completed
   */
  shouldDisableWhenCompleted(questionnaireId: string): boolean {
    const rule = this.QUALIFICATION_RULES.find(
      (rule) => rule.id === questionnaireId
    );
    return rule ? rule.disableWhenCompleted || false : false;
  }

  /**
   * Check if questionnaire requires email verification
   */
  requiresEmailVerification(questionnaireId: string): boolean {
    const rule = this.QUALIFICATION_RULES.find(
      (rule) => rule.id === questionnaireId
    );
    return rule ? rule.requiresEmailVerification || false : false;
  }

  /**
   * Get missing prerequisites with human-readable names
   */
  getMissingPrerequisiteNames(missingPrerequisites: string[]): string[] {
    return missingPrerequisites.map((id) => {
      if (id === "email-verification") {
        return "電子郵件驗證";
      }
      return this.getQuestionnaireName(id);
    });
  }

  /**
   * Add a new questionnaire qualification rule
   */
  addQualificationRule(rule: QuestionnaireQualification): void {
    const existingIndex = this.QUALIFICATION_RULES.findIndex(
      (r) => r.id === rule.id
    );
    if (existingIndex >= 0) {
      this.QUALIFICATION_RULES[existingIndex] = rule;
    } else {
      this.QUALIFICATION_RULES.push(rule);
    }
  }

  /**
   * Remove a qualification rule
   */
  removeQualificationRule(questionnaireId: string): void {
    const index = this.QUALIFICATION_RULES.findIndex(
      (rule) => rule.id === questionnaireId
    );
    if (index >= 0) {
      this.QUALIFICATION_RULES.splice(index, 1);
    }
  }
}

export default QuestionnaireQualificationService;
