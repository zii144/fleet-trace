/**
 * Example script demonstrating how to configure questionnaires to be disabled when completed
 * This shows the scalable approach for managing questionnaire disabling
 */

// Example usage of the questionnaire qualification utilities
// This would typically be used in your application initialization or admin panel

console.log("🔧 Questionnaire Disabling Configuration Examples");
console.log("================================================");

// Example 1: Configure a questionnaire to be disabled when completed
// This is already done for 'self-info-survey' in the service
console.log(
  "\n📋 Example 1: Configure a questionnaire to be disabled when completed"
);
console.log("qualificationService.addQualificationRule({");
console.log('  id: "self-info-survey",');
console.log('  title: "使用者基本資料收集問卷",');
console.log("  prerequisites: [],");
console.log("  disableWhenCompleted: true");
console.log("});");

// Example 2: Using the utility functions (if you want to add more questionnaires)
console.log(
  "\n📋 Example 2: Using utility functions to configure questionnaires"
);
console.log(
  'import { questionnaireQualificationUtils } from "@/lib/services";'
);
console.log("");
console.log("// Configure a questionnaire to be disabled when completed");
console.log("questionnaireQualificationUtils.setDisableWhenCompleted(");
console.log('  "example-survey",');
console.log('  "Example Survey Title",');
console.log('  ["prerequisite-survey"] // optional prerequisites');
console.log(");");
console.log("");
console.log("// Check if a questionnaire is configured to be disabled");
console.log(
  'const isDisabled = questionnaireQualificationUtils.isDisableWhenCompleted("example-survey");'
);
console.log("");
console.log("// Get all questionnaires that are configured to be disabled");
console.log(
  "const disabledQuestionnaires = questionnaireQualificationUtils.getDisableWhenCompletedQuestionnaires();"
);
console.log("");
console.log("// Remove the disable-when-completed setting");
console.log(
  'questionnaireQualificationUtils.removeDisableWhenCompleted("example-survey");'
);

// Example 3: Adding a new questionnaire that should be disabled when completed
console.log("\n📋 Example 3: Adding a new questionnaire configuration");
console.log(
  "// To add a new questionnaire that should be disabled when completed:"
);
console.log(
  "// 1. Add it to the QUALIFICATION_RULES array in QuestionnaireQualificationService.ts"
);
console.log("// 2. Or use the utility function at runtime");
console.log("");
console.log("// Example configuration:");
console.log("{");
console.log('  id: "new-survey-id",');
console.log('  title: "New Survey Title",');
console.log('  prerequisites: [], // or ["prerequisite-survey"]');
console.log("  disableWhenCompleted: true");
console.log("}");

console.log("\n✅ Configuration examples completed!");
console.log("The system will now:");
console.log("- Show completed questionnaires as disabled (not hidden)");
console.log("- Display a completion message instead of the start button");
console.log("- Maintain all existing qualification functionality");
console.log("- Allow easy addition of new questionnaires with this behavior");
