# Merge Guide: Integrating Advanced Strategy Features into Main Task List

## Quick Merge Instructions

When you're ready to merge the advanced features into `task-list.md`:

### 1. Backup Current Task List
```bash
cp docs/task-list.md docs/task-list-v1-backup.md
```

### 2. Merge Strategy
The enhanced task list maintains your existing structure with **ENHANCED** and **NEW** markers:
- **ENHANCED**: Additions to existing tasks
- **NEW**: Completely new sections/tasks

### 3. Simple Merge Process

#### For Existing Sections:
Look for **ENHANCED** items and add them as sub-tasks:

```markdown
### 1.3 Bot Management Screens
- [x] Design bot creation wizard UI
- [x] Create bot detail page layout
- [x] Build bot configuration forms
- [x] Design webhook URL display component
- [x] Implement bot status indicators
+ - [ ] Add strategy builder tab to bot creation wizard
+ - [ ] Create visual indicator selection interface
+ - [ ] Build strategy template selector
+ - [ ] Add backtesting preview panel
```

#### For New Sections:
Insert **NEW** sections in logical order:

```markdown
### 2.1 Connect UI to Backend
[existing tasks...]

+ ### 2.2 Technical Analysis Engine
+ - [ ] Implement core indicators (EMA, SMA, RSI, MACD, Bollinger Bands)
+ - [ ] Create indicator caching layer with Redis
+ - [ ] Build real-time calculation pipeline
+ - [ ] Set up indicator WebSocket channels
+ - [ ] Create indicator accuracy tracking

+ ### 2.3 Strategy Builder Core
+ - [ ] Implement drag-and-drop canvas functionality
+ [etc...]
```

### 4. Update Metrics
Change the summary metrics at the bottom:

```markdown
### UI Development
- Components built: 15/80 (increased from 50)
- Screens completed: 11/25 (increased from 15)

### Technical Progress
- API endpoints: 17/50 (increased from 30)
```

### 5. Preserve Your Progress
Keep all your existing checkmarks:
- ✅ Task 1.4: Authentication UI
- ✅ Task 1.5: Basic Backend Foundation  
- ✅ Task 1.6: Demo Environment

### 6. Version Tag
Add a version note at the top:

```markdown
# RoR Trader MVP Development Task List - UI First Approach
**Version 2.0** - Enhanced with Advanced Trading Features
```

## Alternative: Gradual Integration

If you prefer gradual integration:

1. **Phase 1**: Add only the visual strategy builder to current tasks
2. **Phase 2**: Add technical indicators after MVP launch
3. **Phase 3**: Add backtesting and advanced features post-beta

## Git Commands for Clean Merge

```bash
# Create feature branch
git checkout -b feature/advanced-trading-strategies

# Make changes
cp docs/MVP-task-list-with-advanced-strategies.md docs/task-list.md

# Commit
git add docs/task-list.md
git commit -m "feat: Add advanced trading strategies to MVP scope"

# When ready to merge
git checkout main
git merge feature/advanced-trading-strategies
```

---

This approach maintains your progress tracking while expanding the MVP scope to include the professional trading features that will set RoR Trader apart from basic webhook bots.
