window.ElectionSim.data = window.ElectionSim.data || {};

window.ElectionSim.data.STATES = [
  {
    name: 'Alabama', abbr: 'AL', electoralVotes: 9,
    partisanLean: 0.75, volatility: 3, turnoutModifier: 0.95,
    demographics: { urban: 0.52, rural: 0.74, suburban: 0.46, young: 0.25, seniors: 0.30, college: 0.34, working_class: 0.73, independent: 0.24, minority: 0.38 },
    issueWeights: { economy: 0.90, healthcare: 0.75, immigration: 0.65, climate: 0.38, taxes: 0.86, crime: 0.82, education: 0.70, foreign_policy: 0.60, energy: 0.70, social_issues: 0.82, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Alaska', abbr: 'AK', electoralVotes: 3,
    partisanLean: 0.30, volatility: 6, turnoutModifier: 0.90,
    demographics: { urban: 0.48, rural: 0.82, suburban: 0.34, young: 0.29, seniors: 0.22, college: 0.38, working_class: 0.72, independent: 0.42, minority: 0.34 },
    issueWeights: { economy: 0.88, healthcare: 0.65, immigration: 0.52, climate: 0.60, taxes: 0.88, crime: 0.60, education: 0.65, foreign_policy: 0.55, energy: 1.00, social_issues: 0.58, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Arizona', abbr: 'AZ', electoralVotes: 11,
    partisanLean: 0.10, volatility: 8, turnoutModifier: 1.10,
    demographics: { urban: 0.78, rural: 0.44, suburban: 0.80, young: 0.31, seniors: 0.38, college: 0.58, working_class: 0.52, independent: 0.38, minority: 0.58 },
    issueWeights: { economy: 0.88, healthcare: 0.88, immigration: 1.00, climate: 0.72, taxes: 0.76, crime: 0.72, education: 0.78, foreign_policy: 0.46, energy: 0.68, social_issues: 0.65, jobs: 0.82 },
    issueLeans:   { economy: 'centrist', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'centrist', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'centrist', jobs: 'centrist' }
  },
  {
    name: 'Arkansas', abbr: 'AR', electoralVotes: 6,
    partisanLean: 0.75, volatility: 3, turnoutModifier: 0.92,
    demographics: { urban: 0.46, rural: 0.78, suburban: 0.40, young: 0.25, seniors: 0.28, college: 0.30, working_class: 0.78, independent: 0.22, minority: 0.28 },
    issueWeights: { economy: 0.90, healthcare: 0.72, immigration: 0.68, climate: 0.35, taxes: 0.88, crime: 0.80, education: 0.72, foreign_policy: 0.52, energy: 0.68, social_issues: 0.82, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'California', abbr: 'CA', electoralVotes: 54,
    partisanLean: -0.60, volatility: 3, turnoutModifier: 1.10,
    demographics: { urban: 0.92, rural: 0.10, suburban: 0.62, young: 0.34, seniors: 0.28, college: 0.68, working_class: 0.46, independent: 0.38, minority: 0.72 },
    issueWeights: { economy: 0.76, healthcare: 0.90, immigration: 0.88, climate: 1.00, taxes: 0.68, crime: 0.56, education: 0.88, foreign_policy: 0.62, energy: 0.80, social_issues: 0.88, jobs: 0.78 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Colorado', abbr: 'CO', electoralVotes: 10,
    partisanLean: -0.30, volatility: 7, turnoutModifier: 1.15,
    demographics: { urban: 0.78, rural: 0.42, suburban: 0.74, young: 0.34, seniors: 0.25, college: 0.72, working_class: 0.44, independent: 0.42, minority: 0.42 },
    issueWeights: { economy: 0.88, healthcare: 0.88, immigration: 0.78, climate: 0.95, taxes: 0.72, crime: 0.62, education: 0.82, foreign_policy: 0.44, energy: 0.72, social_issues: 0.72, jobs: 0.82 },
    issueLeans:   { economy: 'centrist', healthcare: 'liberal', immigration: 'centrist', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Connecticut', abbr: 'CT', electoralVotes: 7,
    partisanLean: -0.40, volatility: 5, turnoutModifier: 1.05,
    demographics: { urban: 0.78, rural: 0.28, suburban: 0.70, young: 0.28, seniors: 0.32, college: 0.68, working_class: 0.48, independent: 0.32, minority: 0.36 },
    issueWeights: { economy: 0.88, healthcare: 0.92, immigration: 0.65, climate: 0.78, taxes: 0.80, crime: 0.65, education: 0.82, foreign_policy: 0.48, energy: 0.55, social_issues: 0.75, jobs: 0.82 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Delaware', abbr: 'DE', electoralVotes: 3,
    partisanLean: -0.40, volatility: 4, turnoutModifier: 1.08,
    demographics: { urban: 0.72, rural: 0.32, suburban: 0.64, young: 0.28, seniors: 0.30, college: 0.62, working_class: 0.52, independent: 0.30, minority: 0.42 },
    issueWeights: { economy: 0.88, healthcare: 0.90, immigration: 0.60, climate: 0.72, taxes: 0.75, crime: 0.70, education: 0.78, foreign_policy: 0.40, energy: 0.55, social_issues: 0.70, jobs: 0.85 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'centrist', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Florida', abbr: 'FL', electoralVotes: 30,
    partisanLean: 0.25, volatility: 7, turnoutModifier: 1.15,
    demographics: { urban: 0.68, rural: 0.48, suburban: 0.72, young: 0.28, seniors: 0.82, college: 0.55, working_class: 0.58, independent: 0.36, minority: 0.62 },
    issueWeights: { economy: 0.92, healthcare: 0.92, immigration: 0.88, climate: 0.75, taxes: 0.80, crime: 0.78, education: 0.78, foreign_policy: 0.55, energy: 0.62, social_issues: 0.72, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'centrist', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Georgia', abbr: 'GA', electoralVotes: 16,
    partisanLean: 0.05, volatility: 8, turnoutModifier: 1.20,
    demographics: { urban: 0.78, rural: 0.48, suburban: 0.78, young: 0.32, seniors: 0.28, college: 0.62, working_class: 0.55, independent: 0.32, minority: 0.70 },
    issueWeights: { economy: 0.92, healthcare: 0.88, immigration: 0.72, climate: 0.68, taxes: 0.78, crime: 0.82, education: 0.80, foreign_policy: 0.48, energy: 0.62, social_issues: 0.72, jobs: 0.88 },
    issueLeans:   { economy: 'centrist', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'centrist', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'conservative', jobs: 'centrist' }
  },
  {
    name: 'Hawaii', abbr: 'HI', electoralVotes: 4,
    partisanLean: -0.65, volatility: 3, turnoutModifier: 1.02,
    demographics: { urban: 0.88, rural: 0.12, suburban: 0.44, young: 0.32, seniors: 0.22, college: 0.68, working_class: 0.52, independent: 0.30, minority: 0.72 },
    issueWeights: { economy: 0.74, healthcare: 0.88, immigration: 0.72, climate: 0.92, taxes: 0.66, crime: 0.44, education: 0.80, foreign_policy: 0.62, energy: 0.75, social_issues: 0.80, jobs: 0.75 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Idaho', abbr: 'ID', electoralVotes: 4,
    partisanLean: 1.00, volatility: 3, turnoutModifier: 0.92,
    demographics: { urban: 0.38, rural: 0.82, suburban: 0.40, young: 0.28, seniors: 0.25, college: 0.32, working_class: 0.75, independent: 0.28, minority: 0.18 },
    issueWeights: { economy: 0.88, healthcare: 0.62, immigration: 0.72, climate: 0.32, taxes: 0.90, crime: 0.75, education: 0.68, foreign_policy: 0.55, energy: 0.90, social_issues: 0.82, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Illinois', abbr: 'IL', electoralVotes: 19,
    partisanLean: -0.55, volatility: 5, turnoutModifier: 1.05,
    demographics: { urban: 0.80, rural: 0.46, suburban: 0.68, young: 0.30, seniors: 0.28, college: 0.62, working_class: 0.55, independent: 0.32, minority: 0.52 },
    issueWeights: { economy: 0.90, healthcare: 0.88, immigration: 0.72, climate: 0.75, taxes: 0.82, crime: 0.82, education: 0.82, foreign_policy: 0.45, energy: 0.62, social_issues: 0.72, jobs: 0.88 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Indiana', abbr: 'IN', electoralVotes: 11,
    partisanLean: 0.75, volatility: 4, turnoutModifier: 0.95,
    demographics: { urban: 0.55, rural: 0.68, suburban: 0.60, young: 0.26, seniors: 0.28, college: 0.40, working_class: 0.68, independent: 0.28, minority: 0.25 },
    issueWeights: { economy: 0.90, healthcare: 0.75, immigration: 0.68, climate: 0.40, taxes: 0.88, crime: 0.78, education: 0.72, foreign_policy: 0.55, energy: 0.72, social_issues: 0.80, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Iowa', abbr: 'IA', electoralVotes: 6,
    partisanLean: 0.50, volatility: 6, turnoutModifier: 1.05,
    demographics: { urban: 0.62, rural: 0.70, suburban: 0.58, young: 0.26, seniors: 0.30, college: 0.48, working_class: 0.65, independent: 0.34, minority: 0.18 },
    issueWeights: { economy: 0.92, healthcare: 0.80, immigration: 0.72, climate: 0.58, taxes: 0.85, crime: 0.75, education: 0.78, foreign_policy: 0.45, energy: 0.72, social_issues: 0.75, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Kansas', abbr: 'KS', electoralVotes: 6,
    partisanLean: 0.75, volatility: 4, turnoutModifier: 0.95,
    demographics: { urban: 0.52, rural: 0.75, suburban: 0.55, young: 0.25, seniors: 0.28, college: 0.42, working_class: 0.68, independent: 0.28, minority: 0.22 },
    issueWeights: { economy: 0.88, healthcare: 0.72, immigration: 0.68, climate: 0.38, taxes: 0.88, crime: 0.75, education: 0.72, foreign_policy: 0.52, energy: 0.78, social_issues: 0.82, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Kentucky', abbr: 'KY', electoralVotes: 8,
    partisanLean: 1.20, volatility: 3, turnoutModifier: 0.92,
    demographics: { urban: 0.50, rural: 0.80, suburban: 0.50, young: 0.24, seniors: 0.28, college: 0.32, working_class: 0.78, independent: 0.22, minority: 0.22 },
    issueWeights: { economy: 0.90, healthcare: 0.80, immigration: 0.65, climate: 0.34, taxes: 0.88, crime: 0.80, education: 0.70, foreign_policy: 0.52, energy: 0.85, social_issues: 0.85, jobs: 0.92 },
    issueLeans:   { economy: 'conservative', healthcare: 'centrist', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Louisiana', abbr: 'LA', electoralVotes: 8,
    partisanLean: 0.75, volatility: 4, turnoutModifier: 0.95,
    demographics: { urban: 0.60, rural: 0.72, suburban: 0.54, young: 0.28, seniors: 0.28, college: 0.38, working_class: 0.70, independent: 0.25, minority: 0.45 },
    issueWeights: { economy: 0.90, healthcare: 0.78, immigration: 0.68, climate: 0.62, taxes: 0.85, crime: 0.88, education: 0.72, foreign_policy: 0.55, energy: 0.88, social_issues: 0.82, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Maine', abbr: 'ME', electoralVotes: 4,
    partisanLean: -0.20, volatility: 7, turnoutModifier: 1.08,
    demographics: { urban: 0.44, rural: 0.72, suburban: 0.48, young: 0.26, seniors: 0.32, college: 0.52, working_class: 0.62, independent: 0.44, minority: 0.08 },
    issueWeights: { economy: 0.90, healthcare: 0.88, immigration: 0.58, climate: 0.75, taxes: 0.80, crime: 0.62, education: 0.80, foreign_policy: 0.45, energy: 0.72, social_issues: 0.65, jobs: 0.90 },
    issueLeans:   { economy: 'centrist', healthcare: 'liberal', immigration: 'centrist', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Maryland', abbr: 'MD', electoralVotes: 10,
    partisanLean: -1.00, volatility: 4, turnoutModifier: 1.10,
    demographics: { urban: 0.85, rural: 0.24, suburban: 0.72, young: 0.30, seniors: 0.28, college: 0.68, working_class: 0.48, independent: 0.30, minority: 0.58 },
    issueWeights: { economy: 0.80, healthcare: 0.90, immigration: 0.72, climate: 0.80, taxes: 0.72, crime: 0.72, education: 0.85, foreign_policy: 0.58, energy: 0.62, social_issues: 0.80, jobs: 0.80 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'centrist', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Massachusetts', abbr: 'MA', electoralVotes: 11,
    partisanLean: -1.25, volatility: 3, turnoutModifier: 1.10,
    demographics: { urban: 0.88, rural: 0.18, suburban: 0.68, young: 0.30, seniors: 0.30, college: 0.78, working_class: 0.44, independent: 0.40, minority: 0.30 },
    issueWeights: { economy: 0.78, healthcare: 0.92, immigration: 0.68, climate: 0.88, taxes: 0.72, crime: 0.48, education: 0.90, foreign_policy: 0.55, energy: 0.65, social_issues: 0.82, jobs: 0.75 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Michigan', abbr: 'MI', electoralVotes: 15,
    partisanLean: -0.10, volatility: 8, turnoutModifier: 1.10,
    demographics: { urban: 0.72, rural: 0.60, suburban: 0.72, young: 0.28, seniors: 0.30, college: 0.52, working_class: 0.65, independent: 0.35, minority: 0.38 },
    issueWeights: { economy: 0.92, healthcare: 0.88, immigration: 0.68, climate: 0.72, taxes: 0.80, crime: 0.78, education: 0.80, foreign_policy: 0.42, energy: 0.72, social_issues: 0.68, jobs: 0.95 },
    issueLeans:   { economy: 'centrist', healthcare: 'liberal', immigration: 'centrist', climate: 'centrist', taxes: 'centrist', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'centrist', jobs: 'liberal' }
  },
  {
    name: 'Minnesota', abbr: 'MN', electoralVotes: 10,
    partisanLean: -0.30, volatility: 7, turnoutModifier: 1.15,
    demographics: { urban: 0.75, rural: 0.65, suburban: 0.68, young: 0.28, seniors: 0.28, college: 0.60, working_class: 0.58, independent: 0.36, minority: 0.28 },
    issueWeights: { economy: 0.90, healthcare: 0.90, immigration: 0.65, climate: 0.80, taxes: 0.78, crime: 0.72, education: 0.85, foreign_policy: 0.42, energy: 0.72, social_issues: 0.70, jobs: 0.88 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'centrist', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Mississippi', abbr: 'MS', electoralVotes: 6,
    partisanLean: 0.75, volatility: 3, turnoutModifier: 0.90,
    demographics: { urban: 0.48, rural: 0.78, suburban: 0.42, young: 0.26, seniors: 0.28, college: 0.30, working_class: 0.75, independent: 0.22, minority: 0.48 },
    issueWeights: { economy: 0.90, healthcare: 0.75, immigration: 0.65, climate: 0.38, taxes: 0.85, crime: 0.85, education: 0.72, foreign_policy: 0.55, energy: 0.72, social_issues: 0.85, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Missouri', abbr: 'MO', electoralVotes: 10,
    partisanLean: 0.75, volatility: 4, turnoutModifier: 0.98,
    demographics: { urban: 0.65, rural: 0.70, suburban: 0.60, young: 0.27, seniors: 0.28, college: 0.45, working_class: 0.68, independent: 0.28, minority: 0.28 },
    issueWeights: { economy: 0.90, healthcare: 0.78, immigration: 0.68, climate: 0.42, taxes: 0.88, crime: 0.82, education: 0.75, foreign_policy: 0.52, energy: 0.72, social_issues: 0.82, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Montana', abbr: 'MT', electoralVotes: 4,
    partisanLean: 0.60, volatility: 5, turnoutModifier: 0.95,
    demographics: { urban: 0.38, rural: 0.85, suburban: 0.34, young: 0.26, seniors: 0.28, college: 0.40, working_class: 0.72, independent: 0.36, minority: 0.20 },
    issueWeights: { economy: 0.88, healthcare: 0.68, immigration: 0.60, climate: 0.55, taxes: 0.88, crime: 0.68, education: 0.70, foreign_policy: 0.45, energy: 0.88, social_issues: 0.72, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'centrist', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Nebraska', abbr: 'NE', electoralVotes: 5,
    partisanLean: 0.70, volatility: 4, turnoutModifier: 0.95,
    demographics: { urban: 0.55, rural: 0.78, suburban: 0.50, young: 0.27, seniors: 0.28, college: 0.40, working_class: 0.68, independent: 0.28, minority: 0.22 },
    issueWeights: { economy: 0.90, healthcare: 0.72, immigration: 0.68, climate: 0.40, taxes: 0.88, crime: 0.75, education: 0.72, foreign_policy: 0.52, energy: 0.78, social_issues: 0.80, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Nevada', abbr: 'NV', electoralVotes: 6,
    partisanLean: -0.10, volatility: 8, turnoutModifier: 1.05,
    demographics: { urban: 0.82, rural: 0.34, suburban: 0.64, young: 0.30, seniors: 0.30, college: 0.45, working_class: 0.62, independent: 0.38, minority: 0.52 },
    issueWeights: { economy: 0.92, healthcare: 0.85, immigration: 0.82, climate: 0.70, taxes: 0.78, crime: 0.72, education: 0.75, foreign_policy: 0.42, energy: 0.62, social_issues: 0.68, jobs: 0.92 },
    issueLeans:   { economy: 'centrist', healthcare: 'centrist', immigration: 'liberal', climate: 'centrist', taxes: 'centrist', crime: 'centrist', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'centrist', jobs: 'liberal' }
  },
  {
    name: 'New Hampshire', abbr: 'NH', electoralVotes: 4,
    partisanLean: -0.10, volatility: 8, turnoutModifier: 1.10,
    demographics: { urban: 0.52, rural: 0.58, suburban: 0.64, young: 0.28, seniors: 0.28, college: 0.60, working_class: 0.55, independent: 0.46, minority: 0.12 },
    issueWeights: { economy: 0.90, healthcare: 0.88, immigration: 0.60, climate: 0.72, taxes: 0.85, crime: 0.65, education: 0.82, foreign_policy: 0.42, energy: 0.65, social_issues: 0.65, jobs: 0.88 },
    issueLeans:   { economy: 'centrist', healthcare: 'liberal', immigration: 'centrist', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'centrist', jobs: 'centrist' }
  },
  {
    name: 'New Jersey', abbr: 'NJ', electoralVotes: 14,
    partisanLean: -0.60, volatility: 5, turnoutModifier: 1.05,
    demographics: { urban: 0.82, rural: 0.22, suburban: 0.78, young: 0.28, seniors: 0.30, college: 0.68, working_class: 0.50, independent: 0.30, minority: 0.42 },
    issueWeights: { economy: 0.88, healthcare: 0.90, immigration: 0.72, climate: 0.78, taxes: 0.82, crime: 0.72, education: 0.85, foreign_policy: 0.48, energy: 0.58, social_issues: 0.75, jobs: 0.85 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'New Mexico', abbr: 'NM', electoralVotes: 5,
    partisanLean: -0.40, volatility: 6, turnoutModifier: 1.00,
    demographics: { urban: 0.68, rural: 0.48, suburban: 0.52, young: 0.28, seniors: 0.28, college: 0.52, working_class: 0.60, independent: 0.32, minority: 0.65 },
    issueWeights: { economy: 0.88, healthcare: 0.85, immigration: 0.90, climate: 0.72, taxes: 0.72, crime: 0.72, education: 0.82, foreign_policy: 0.45, energy: 0.72, social_issues: 0.72, jobs: 0.85 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'New York', abbr: 'NY', electoralVotes: 28,
    partisanLean: -1.00, volatility: 4, turnoutModifier: 1.08,
    demographics: { urban: 0.90, rural: 0.24, suburban: 0.62, young: 0.30, seniors: 0.28, college: 0.70, working_class: 0.48, independent: 0.30, minority: 0.55 },
    issueWeights: { economy: 0.80, healthcare: 0.90, immigration: 0.75, climate: 0.85, taxes: 0.75, crime: 0.70, education: 0.88, foreign_policy: 0.55, energy: 0.60, social_issues: 0.85, jobs: 0.80 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'North Carolina', abbr: 'NC', electoralVotes: 16,
    partisanLean: 0.20, volatility: 8, turnoutModifier: 1.12,
    demographics: { urban: 0.70, rural: 0.60, suburban: 0.75, young: 0.30, seniors: 0.28, college: 0.60, working_class: 0.58, independent: 0.32, minority: 0.52 },
    issueWeights: { economy: 0.90, healthcare: 0.85, immigration: 0.72, climate: 0.65, taxes: 0.80, crime: 0.80, education: 0.80, foreign_policy: 0.48, energy: 0.65, social_issues: 0.75, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'North Dakota', abbr: 'ND', electoralVotes: 3,
    partisanLean: 1.25, volatility: 3, turnoutModifier: 0.90,
    demographics: { urban: 0.35, rural: 0.88, suburban: 0.30, young: 0.26, seniors: 0.25, college: 0.35, working_class: 0.75, independent: 0.28, minority: 0.20 },
    issueWeights: { economy: 0.88, healthcare: 0.65, immigration: 0.60, climate: 0.34, taxes: 0.88, crime: 0.68, education: 0.68, foreign_policy: 0.48, energy: 0.95, social_issues: 0.80, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Ohio', abbr: 'OH', electoralVotes: 17,
    partisanLean: 0.30, volatility: 7, turnoutModifier: 1.05,
    demographics: { urban: 0.70, rural: 0.65, suburban: 0.70, young: 0.27, seniors: 0.30, college: 0.48, working_class: 0.65, independent: 0.32, minority: 0.30 },
    issueWeights: { economy: 0.92, healthcare: 0.88, immigration: 0.68, climate: 0.58, taxes: 0.82, crime: 0.80, education: 0.78, foreign_policy: 0.45, energy: 0.72, social_issues: 0.75, jobs: 0.92 },
    issueLeans:   { economy: 'conservative', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Oklahoma', abbr: 'OK', electoralVotes: 7,
    partisanLean: 1.25, volatility: 3, turnoutModifier: 0.90,
    demographics: { urban: 0.58, rural: 0.78, suburban: 0.52, young: 0.26, seniors: 0.27, college: 0.35, working_class: 0.72, independent: 0.22, minority: 0.28 },
    issueWeights: { economy: 0.90, healthcare: 0.68, immigration: 0.68, climate: 0.38, taxes: 0.88, crime: 0.80, education: 0.70, foreign_policy: 0.58, energy: 0.95, social_issues: 0.85, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Oregon', abbr: 'OR', electoralVotes: 8,
    partisanLean: -0.50, volatility: 6, turnoutModifier: 1.12,
    demographics: { urban: 0.80, rural: 0.48, suburban: 0.64, young: 0.30, seniors: 0.25, college: 0.62, working_class: 0.52, independent: 0.38, minority: 0.30 },
    issueWeights: { economy: 0.82, healthcare: 0.88, immigration: 0.70, climate: 0.90, taxes: 0.70, crime: 0.58, education: 0.85, foreign_policy: 0.48, energy: 0.80, social_issues: 0.80, jobs: 0.82 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'centrist', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Pennsylvania', abbr: 'PA', electoralVotes: 19,
    partisanLean: -0.10, volatility: 8, turnoutModifier: 1.10,
    demographics: { urban: 0.72, rural: 0.65, suburban: 0.78, young: 0.27, seniors: 0.32, college: 0.55, working_class: 0.65, independent: 0.35, minority: 0.32 },
    issueWeights: { economy: 0.92, healthcare: 0.90, immigration: 0.68, climate: 0.70, taxes: 0.82, crime: 0.80, education: 0.80, foreign_policy: 0.45, energy: 0.72, social_issues: 0.70, jobs: 0.92 },
    issueLeans:   { economy: 'centrist', healthcare: 'centrist', immigration: 'conservative', climate: 'centrist', taxes: 'centrist', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'centrist', jobs: 'centrist' }
  },
  {
    name: 'Rhode Island', abbr: 'RI', electoralVotes: 4,
    partisanLean: -0.85, volatility: 4, turnoutModifier: 1.05,
    demographics: { urban: 0.82, rural: 0.18, suburban: 0.64, young: 0.26, seniors: 0.30, college: 0.60, working_class: 0.55, independent: 0.30, minority: 0.32 },
    issueWeights: { economy: 0.85, healthcare: 0.90, immigration: 0.68, climate: 0.75, taxes: 0.78, crime: 0.68, education: 0.82, foreign_policy: 0.40, energy: 0.55, social_issues: 0.78, jobs: 0.85 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'South Carolina', abbr: 'SC', electoralVotes: 9,
    partisanLean: 0.60, volatility: 5, turnoutModifier: 1.00,
    demographics: { urban: 0.60, rural: 0.68, suburban: 0.64, young: 0.27, seniors: 0.28, college: 0.48, working_class: 0.65, independent: 0.27, minority: 0.42 },
    issueWeights: { economy: 0.90, healthcare: 0.75, immigration: 0.68, climate: 0.48, taxes: 0.85, crime: 0.82, education: 0.72, foreign_policy: 0.58, energy: 0.68, social_issues: 0.82, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'South Dakota', abbr: 'SD', electoralVotes: 3,
    partisanLean: 0.90, volatility: 3, turnoutModifier: 0.92,
    demographics: { urban: 0.38, rural: 0.82, suburban: 0.32, young: 0.26, seniors: 0.25, college: 0.35, working_class: 0.75, independent: 0.28, minority: 0.20 },
    issueWeights: { economy: 0.88, healthcare: 0.65, immigration: 0.60, climate: 0.38, taxes: 0.88, crime: 0.72, education: 0.70, foreign_policy: 0.48, energy: 0.88, social_issues: 0.82, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Tennessee', abbr: 'TN', electoralVotes: 11,
    partisanLean: 1.00, volatility: 3, turnoutModifier: 0.93,
    demographics: { urban: 0.62, rural: 0.72, suburban: 0.60, young: 0.26, seniors: 0.27, college: 0.40, working_class: 0.68, independent: 0.25, minority: 0.30 },
    issueWeights: { economy: 0.90, healthcare: 0.75, immigration: 0.68, climate: 0.38, taxes: 0.88, crime: 0.82, education: 0.72, foreign_policy: 0.58, energy: 0.72, social_issues: 0.85, jobs: 0.90 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Texas', abbr: 'TX', electoralVotes: 40,
    partisanLean: 0.25, volatility: 6, turnoutModifier: 1.05,
    demographics: { urban: 0.80, rural: 0.44, suburban: 0.75, young: 0.32, seniors: 0.24, college: 0.55, working_class: 0.58, independent: 0.30, minority: 0.60 },
    issueWeights: { economy: 0.90, healthcare: 0.82, immigration: 0.90, climate: 0.60, taxes: 0.88, crime: 0.80, education: 0.78, foreign_policy: 0.58, energy: 0.92, social_issues: 0.78, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Utah', abbr: 'UT', electoralVotes: 6,
    partisanLean: 0.75, volatility: 5, turnoutModifier: 0.95,
    demographics: { urban: 0.68, rural: 0.55, suburban: 0.64, young: 0.35, seniors: 0.22, college: 0.52, working_class: 0.55, independent: 0.36, minority: 0.25 },
    issueWeights: { economy: 0.88, healthcare: 0.72, immigration: 0.65, climate: 0.55, taxes: 0.88, crime: 0.72, education: 0.80, foreign_policy: 0.50, energy: 0.80, social_issues: 0.85, jobs: 0.88 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'centrist', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Vermont', abbr: 'VT', electoralVotes: 3,
    partisanLean: -1.50, volatility: 3, turnoutModifier: 1.12,
    demographics: { urban: 0.40, rural: 0.78, suburban: 0.38, young: 0.28, seniors: 0.30, college: 0.68, working_class: 0.52, independent: 0.46, minority: 0.10 },
    issueWeights: { economy: 0.75, healthcare: 0.92, immigration: 0.65, climate: 0.92, taxes: 0.68, crime: 0.42, education: 0.88, foreign_policy: 0.48, energy: 0.80, social_issues: 0.82, jobs: 0.78 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Virginia', abbr: 'VA', electoralVotes: 13,
    partisanLean: -0.15, volatility: 7, turnoutModifier: 1.15,
    demographics: { urban: 0.78, rural: 0.48, suburban: 0.80, young: 0.30, seniors: 0.27, college: 0.68, working_class: 0.50, independent: 0.35, minority: 0.55 },
    issueWeights: { economy: 0.88, healthcare: 0.88, immigration: 0.72, climate: 0.72, taxes: 0.78, crime: 0.72, education: 0.85, foreign_policy: 0.58, energy: 0.60, social_issues: 0.72, jobs: 0.85 },
    issueLeans:   { economy: 'centrist', healthcare: 'liberal', immigration: 'centrist', climate: 'liberal', taxes: 'centrist', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'Washington', abbr: 'WA', electoralVotes: 12,
    partisanLean: -0.50, volatility: 6, turnoutModifier: 1.15,
    demographics: { urban: 0.88, rural: 0.38, suburban: 0.70, young: 0.32, seniors: 0.25, college: 0.68, working_class: 0.50, independent: 0.38, minority: 0.40 },
    issueWeights: { economy: 0.80, healthcare: 0.88, immigration: 0.70, climate: 0.92, taxes: 0.70, crime: 0.55, education: 0.88, foreign_policy: 0.50, energy: 0.82, social_issues: 0.80, jobs: 0.82 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'centrist', education: 'liberal', foreign_policy: 'centrist', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  },
  {
    name: 'West Virginia', abbr: 'WV', electoralVotes: 4,
    partisanLean: 1.05, volatility: 3, turnoutModifier: 0.92,
    demographics: { urban: 0.38, rural: 0.88, suburban: 0.32, young: 0.22, seniors: 0.32, college: 0.25, working_class: 0.88, independent: 0.20, minority: 0.08 },
    issueWeights: { economy: 0.92, healthcare: 0.85, immigration: 0.60, climate: 0.28, taxes: 0.85, crime: 0.78, education: 0.68, foreign_policy: 0.52, energy: 1.00, social_issues: 0.80, jobs: 1.00 },
    issueLeans:   { economy: 'conservative', healthcare: 'centrist', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'Wisconsin', abbr: 'WI', electoralVotes: 10,
    partisanLean: 0.00, volatility: 8, turnoutModifier: 1.10,
    demographics: { urban: 0.75, rural: 0.68, suburban: 0.72, young: 0.27, seniors: 0.29, college: 0.55, working_class: 0.62, independent: 0.36, minority: 0.22 },
    issueWeights: { economy: 0.92, healthcare: 0.88, immigration: 0.65, climate: 0.72, taxes: 0.82, crime: 0.78, education: 0.82, foreign_policy: 0.42, energy: 0.68, social_issues: 0.68, jobs: 0.92 },
    issueLeans:   { economy: 'centrist', healthcare: 'centrist', immigration: 'centrist', climate: 'centrist', taxes: 'centrist', crime: 'conservative', education: 'centrist', foreign_policy: 'centrist', energy: 'centrist', social_issues: 'centrist', jobs: 'liberal' }
  },
  {
    name: 'Wyoming', abbr: 'WY', electoralVotes: 3,
    partisanLean: 1.15, volatility: 3, turnoutModifier: 0.90,
    demographics: { urban: 0.20, rural: 0.92, suburban: 0.22, young: 0.22, seniors: 0.28, college: 0.28, working_class: 0.80, independent: 0.25, minority: 0.10 },
    issueWeights: { economy: 0.90, healthcare: 0.60, immigration: 0.60, climate: 0.25, taxes: 0.92, crime: 0.72, education: 0.65, foreign_policy: 0.52, energy: 1.00, social_issues: 0.82, jobs: 0.92 },
    issueLeans:   { economy: 'conservative', healthcare: 'conservative', immigration: 'conservative', climate: 'conservative', taxes: 'conservative', crime: 'conservative', education: 'conservative', foreign_policy: 'conservative', energy: 'conservative', social_issues: 'conservative', jobs: 'conservative' }
  },
  {
    name: 'District of Columbia', abbr: 'DC', electoralVotes: 3,
    partisanLean: -2.20, volatility: 2, turnoutModifier: 1.20,
    demographics: { urban: 1.00, rural: 0.00, suburban: 0.20, young: 0.35, seniors: 0.18, college: 0.80, working_class: 0.34, independent: 0.18, minority: 0.72 },
    issueWeights: { economy: 0.70, healthcare: 0.92, immigration: 0.80, climate: 0.85, taxes: 0.62, crime: 0.78, education: 0.88, foreign_policy: 0.70, energy: 0.60, social_issues: 0.90, jobs: 0.75 },
    issueLeans:   { economy: 'liberal', healthcare: 'liberal', immigration: 'liberal', climate: 'liberal', taxes: 'liberal', crime: 'liberal', education: 'liberal', foreign_policy: 'liberal', energy: 'liberal', social_issues: 'liberal', jobs: 'liberal' }
  }
];