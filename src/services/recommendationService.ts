import { Recommendation, Student, WordCategory } from '../types';
import { dataService } from './dataService';

export class RecommendationService {
  /**
   * Generates actionable, encouraging practice recommendations based on student performance.
   */
  public getRecommendations(student: Student): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const mistakes = dataService.getMistakes();
    const isDailyDone = dataService.isDailyChallengeCompletedToday();

    // 1. Daily Challenge check
    if (!isDailyDone) {
      recommendations.push({
        id: 'rec_daily',
        title: "Today's Daily Challenge",
        reason: 'Complete today’s 10-word mixed drill to maintain your active streak.',
        action: 'Start Daily Challenge',
        targetMode: 'daily'
      });
    }

    // 2. Mistake Review check
    if (mistakes.length >= 2) {
      recommendations.push({
        id: 'rec_mistakes',
        title: 'Review Difficult Words',
        reason: `You have ${mistakes.length} words flagged for review. Turn them into permanent memory.`,
        action: 'Review Mistakes',
        targetMode: 'mistakes',
        targetWordIds: mistakes.map(m => m.id)
      });
    }

    // 3. Category Focus check
    const categoryStats = dataService.getCategoryAccuracy();
    const categories: WordCategory[] = ['Science & Nature', 'Governance & Law', 'Technology', 'General Vocabulary'];
    
    // Find category with lowest accuracy or least practiced
    let lowestCategory: { category: WordCategory; accuracy: number } | null = null;
    for (const cat of categories) {
      const stat = categoryStats[cat];
      if (stat && stat.total >= 3 && stat.accuracy < 80) {
        if (!lowestCategory || stat.accuracy < lowestCategory.accuracy) {
          lowestCategory = { category: cat, accuracy: stat.accuracy };
        }
      }
    }

    if (lowestCategory) {
      recommendations.push({
        id: `rec_cat_${lowestCategory.category}`,
        title: `Strengthen ${lowestCategory.category}`,
        reason: `Targeting specialized ${lowestCategory.category} vocabulary will boost your overall competition score.`,
        action: `Practice ${lowestCategory.category}`,
        targetMode: 'focused',
        targetCategory: lowestCategory.category
      });
    } else {
      // High performer -> Recommend competition simulation
      recommendations.push({
        id: 'rec_comp',
        title: 'Timed Competition Simulation',
        reason: 'Your foundational accuracy is strong (85%+). Test your speed under the 45-second clock.',
        action: 'Start Competition Mode',
        targetMode: 'competition'
      });
    }

    return recommendations.slice(0, 3);
  }
}

export const recommendationService = new RecommendationService();
