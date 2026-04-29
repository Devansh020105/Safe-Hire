import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Download necessary data for NLTK 
nltk.download('vader_lexicon')

def analyze_employer_credibility(reviews):
    sia = SentimentIntensityAnalyzer()
    risk_keywords = ["unpaid", "bond", "toxic", "overtime", "fake"] # 
    
    total_score = 0
    flags = []

    for review in reviews:
        # 1. Sentiment Analysis [cite: 8]
        score = sia.polarity_scores(review)['compound']
        total_score += score
        
        # 2. Risk Flag Detection 
        for word in risk_keywords:
            if word in review.lower():      
                flags.append(word)

    # Calculate Trust Score (scaled 1-10) 
    avg_sentiment = (total_score / len(reviews)) if reviews else 0
    trust_score = round(((avg_sentiment + 1) / 2) * 10, 1)
    
    return trust_score, list(set(flags))

# Example usage for your demo [cite: 16]
sample_reviews = [
    "Great learning environment but long hours.",
    "They forced me to sign a 2-year employment bond.",
    "Management is toxic and salary is often delayed."
]

score, detected_risks = analyze_employer_credibility(sample_reviews)
print(f"Employer Trust Score: {score}/10")
print(f"Risk Flags Detected: {detected_risks}")