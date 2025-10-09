# Services Catalog Enhancement - Future Phase

## Current State
- Basic service templates with fixed pricing
- User feedback: Too complex for onboarding, doesn't match real pricing models

## Industry Research
- Most contractors use: Flat rate OR Time & Materials
- ServiceTitan: Complex service catalog (complaint: too complicated)
- Housecall Pro: Simple hourly rate (most loved)
- Angi/Thumbtack: No predefined services

## Real-World Pricing Models

### Flat Rate
- "Toilet replacement: $350 flat" (regardless of time)
- "Water heater install: $1,200 flat"
- Challenge: Job complexity variations

### Time & Materials (T&M)
- "$95/hour + parts cost"
- "2-hour minimum, then $95/hour"
- Challenge: Material markup calculations

### Hybrid
- "Service call: $125 flat, then $95/hour"
- "Diagnostic: $150, credited toward repair"

## Future Enhancement Ideas

### Smart Service Builder
```
Service: Leak Repair
├── Pricing Model: [Flat Rate | Hourly | Hybrid]
├── Base Price: $125 (service call)
├── Hourly Rate: $95/hour after first hour
├── Material Markup: 40%
└── Complexity Modifiers:
    ├── Easy Access: +$0
    ├── Crawl Space: +$50
    └── Emergency: +50%
```

### Industry Templates
- Import pricing from industry guides (RSMeans, etc.)
- Regional pricing adjustments
- Seasonal pricing (emergency rates)

### Quote Builder Integration
- Service templates auto-populate quote builder
- Smart suggestions based on job description
- Historical pricing analysis

## Implementation Priority
- Phase 3: Enhanced service catalog
- Phase 4: Advanced pricing models
- Phase 5: Industry integrations

## User Feedback Integration
- Keep onboarding simple (skip option)
- Add services catalog as optional advanced feature
- Focus on getting contractors working quickly
