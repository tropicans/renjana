# Feature Research

**Domain:** Landing Page Introduction & Learner Dashboard
**Researched:** 2026-06-06
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Learning Intro Content | Onboard new users | LOW | Explanation of methods (Mandiri, hybrid, Online, Offline) |
| Learner profile & stats | Establish user identity and activity | LOW | Display avatar, full name, total registrations, active course count |
| Course Progress Bar | Know how far along they are | LOW | Basic percentage calculations based on lessons completed |
| Continue Learning CTA | Quick way to resume last active course | MEDIUM | Resume button linking directly to the last unfinished lesson |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Interactive Learning Timeline | Visual roadmap of course modules/milestones | MEDIUM | Gamified horizontal or vertical step timeline |
| Automated AI Insights | Custom motivational tips and drop-off alerts | MEDIUM | Simple backend/frontend rules analyzing user status vs cohort |
| Direct Feedback View | See instructor grades/comments directly | MEDIUM | Scoped modal or detail view on dashboard |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time push notifications | Get instant reminders | Heavy infrastructure & browser permission friction | Automatic in-app notification banners & Continue cards |

## Feature Dependencies

```
[Timeline / Milestone]
    └──requires──> [Progress / Completed Modules]
                       └──requires──> [Enrollment Data]

[Continue Card] ──enhances──> [Learning Resume Flow]
```

## MVP Definition

### Launch With (v2)

- [ ] **INTRO-01**: Landing page intro content.
- [ ] **LEARN-01**: User details & metrics.
- [ ] **LEARN-02**: Visual progress timeline.
- [ ] **LEARN-03**: Continue Learning Card with resume button.
- [ ] **LEARN-05**: Automated drop-off insights and motivational messages.
- [ ] **LEARN-06**: Learner dashboard feedback viewer.

### Add After Validation (v2.x)

- [ ] **LEARN-04**: Activity trend charts (Recharts).

## Sources

- User requirements document `temp_req_utf8.txt`
- Industry standard LMS dashboard benchmarks (Coursera, Udemy)
