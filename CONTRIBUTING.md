# Contributing to RateMyStartup

Thank you for your interest in contributing to RateMyStartup! 🚀 We welcome contributions from developers of all skill levels and backgrounds.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
- Found a bug? Create a detailed issue report
- Include steps to reproduce the problem
- Mention your browser, OS, and device details
- Screenshots or recordings are super helpful!

### ✨ Feature Requests  
- Have an idea for improvement? We'd love to hear it!
- Explain the problem your feature would solve
- Describe how you envision it working
- Consider the impact on existing users

### 📝 Documentation
- Fix typos or improve clarity
- Add examples or better explanations
- Translate documentation to other languages
- Create tutorials or guides

### 🔧 Code Contributions
- Fix bugs or implement new features
- Improve performance or accessibility
- Add tests or improve test coverage
- Refactor code for better maintainability

## 🚀 Getting Started

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Then clone your fork:
   git clone https://github.com/YOUR_USERNAME/nextjs-hqe9dcff.git
   cd nextjs-hqe9dcff
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify everything works**
   - Open http://localhost:3000
   - Create test account
   - Submit test startup data
   - Ensure all features work

### Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing (when available)
npm run test
npm run test:watch

# Build for production
npm run build
```

## 📋 Contribution Process

### 1. Create an Issue First (Recommended)

Before starting work on a feature or major bug fix:

- **Check existing issues** to avoid duplicates
- **Create a new issue** describing what you plan to work on
- **Wait for maintainer feedback** to ensure it aligns with project goals
- **Claim the issue** by commenting "I'd like to work on this"

### 2. Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/amazing-feature
# or
git checkout -b fix/critical-bug

# 2. Make your changes
# - Write clean, readable code
# - Follow existing code style
# - Add comments where needed
# - Update documentation if necessary

# 3. Test your changes
npm run lint
npm run type-check
npm run build

# 4. Commit with clear messages
git add .
git commit -m "feat: add user profile customization"

# 5. Push to your fork
git push origin feature/amazing-feature

# 6. Create Pull Request on GitHub
```

### 3. Pull Request Guidelines

- **Clear title**: Describe what your PR does in one line
- **Detailed description**: Explain the changes and why they're needed
- **Link related issues**: Use "Fixes #123" or "Closes #456"
- **Screenshots**: For UI changes, include before/after images
- **Test instructions**: How should reviewers test your changes?

#### Good PR Example:
```markdown
## 📝 Description
Adds user profile customization feature allowing users to update their avatar, bio, and preferences.

## 🔗 Related Issues
Fixes #42, Closes #38

## ✨ Changes
- Added profile settings page
- Implemented avatar upload with Supabase Storage
- Added form validation for bio length
- Updated navigation to include profile link

## 🧪 Testing
1. Navigate to /dashboard/profile
2. Upload a new avatar image
3. Update bio and save changes
4. Verify changes persist after page refresh

## 📷 Screenshots
[Before/After images here]
```

## 🎨 Code Style & Standards

### TypeScript & JavaScript
- **Use TypeScript** for all new code
- **Strict type checking** - no `any` types
- **Descriptive variable names** - `submitStartupData` not `submitData`
- **Function comments** using JSDoc format

```typescript
/**
 * Analyzes startup data and returns stage recommendation
 * @param startupData - The startup information to analyze
 * @returns Promise containing analysis results
 */
async function analyzeStartup(startupData: StartupSubmission): Promise<AnalysisResult> {
  // Implementation here
}
```

### React Components
- **Functional components** with hooks (no class components)
- **Custom hooks** for reusable logic
- **Props interfaces** for all components
- **Default exports** for pages, named exports for utilities

```typescript
interface UserProfileProps {
  user: User;
  onUpdate: (data: ProfileData) => void;
}

export default function UserProfile({ user, onUpdate }: UserProfileProps) {
  // Component implementation
}
```

### CSS & Styling
- **Tailwind CSS** for all styling
- **Consistent spacing** using Tailwind's spacing scale
- **Responsive design** - mobile-first approach
- **Dark mode support** where applicable

### Database & API
- **Row Level Security (RLS)** for all new tables
- **Input validation** for all API endpoints
- **Error handling** with meaningful messages
- **SQL migrations** for schema changes

## 🧪 Testing Guidelines

### Test Coverage
- **Unit tests** for utility functions
- **Integration tests** for API routes
- **Component tests** for React components
- **E2E tests** for critical user flows

### Test Naming
```typescript
// Good
describe('StartupAnalysis', () => {
  it('should detect MVP stage for startups with product and customers', () => {
    // Test implementation
  });
});

// Avoid
describe('Test', () => {
  it('works', () => {
    // Test implementation
  });
});
```

## 📚 Documentation Standards

### Code Documentation
- **JSDoc comments** for all functions and classes
- **README updates** for new features
- **API documentation** for new endpoints
- **Component documentation** with Storybook (planned)

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
feat: add user profile customization

# Bug fix
fix: resolve login redirect issue

# Documentation
docs: update installation instructions

# Performance
perf: optimize startup analysis algorithm

# Refactor
refactor: extract common form validation logic
```

## 🐛 Issue Reporting

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS, Windows 10]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
- Device: [e.g. iPhone 12, Desktop]

**Additional context**
Any other context about the problem here.
```

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🏷️ Labels & Project Management

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention is needed
- `priority-high` - Urgent issue
- `priority-low` - Nice to have

### Branch Naming
```bash
# Features
feature/user-profile-settings
feature/ai-analysis-engine

# Bug fixes  
fix/login-redirect-bug
fix/form-validation-error

# Documentation
docs/contributing-guidelines
docs/api-documentation

# Refactoring
refactor/database-schema
refactor/auth-components
```

## 🤝 Community Guidelines

### Code of Conduct
- **Be respectful** and inclusive to all contributors
- **Constructive feedback** - focus on the code, not the person
- **Help others learn** - we all started somewhere
- **Be patient** with review process - maintainers volunteer their time

### Communication
- **GitHub Issues** for bug reports and feature requests
- **GitHub Discussions** for questions and general discussion
- **Pull Request comments** for code-specific feedback
- **Email** (support@ratemystartup.info) for sensitive issues

### Recognition
Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributor statistics**
- **Special thanks** in project announcements

## 🎉 First Time Contributors

### Good First Issues
Look for issues labeled `good-first-issue`:
- Documentation improvements
- Small bug fixes
- UI/UX enhancements
- Test additions

### Getting Help
- **Read the docs** - start with README.md
- **Check existing issues** - your question might be answered
- **Ask in discussions** - community is friendly and helpful
- **Ping maintainers** - we're here to help!

### What to Expect
- **Review timeline**: We aim to review PRs within 48 hours
- **Feedback style**: Constructive and educational
- **Merge process**: Squash and merge for clean history
- **Recognition**: All contributors are valued and recognized

## 📞 Questions?

- 💬 **GitHub Discussions**: For general questions
- 🐛 **GitHub Issues**: For specific problems
- 📧 **Email**: support@ratemystartup.info
- 🐦 **Twitter**: 

---

**Thank you for contributing to RateMyStartup! Together, we're building something amazing for the startup community.** 🚀

*Remember: No contribution is too small. Whether it's fixing a typo or implementing a major feature, every contribution makes the project better!*
