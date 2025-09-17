# Pull Request Status Dashboard

This feature provides administrators with a comprehensive dashboard to monitor and manage pull requests in the DrinkMates repository.

## Features

- **Real-time PR Status Monitoring**: View all open, draft, and ready-for-review pull requests
- **Comprehensive PR Information**: See PR titles, descriptions, authors, assignees, and reviewers  
- **Visual Status Indicators**: Color-coded badges and icons for different PR states
- **Branch Tracking**: View source and target branches for each PR
- **Direct GitHub Integration**: Click to view PRs directly on GitHub
- **Multilingual Support**: Available in English and Arabic
- **Responsive Design**: Works on desktop and mobile devices

## Access

The PR Status dashboard is accessible to administrators at:
- **URL**: `/admin/pr-status`
- **Navigation**: Admin Dashboard → PR Status
- **Requirements**: Admin role authentication required

## Dashboard Sections

### 1. Statistics Cards
- **Total PRs**: Total number of pull requests
- **Open**: Currently open pull requests
- **Draft**: Pull requests in draft state
- **Ready for Review**: Open PRs that are ready for review

### 2. Pull Request List
Each PR card displays:
- PR title and number
- Status badge (Open, Draft, Closed, Merged)
- Author information
- Creation and last update dates
- Source and target branches
- Assigned reviewers and assignees
- Direct link to GitHub

## API Endpoints

### GET `/api/admin/pr-status`
Fetches current pull request status and statistics.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "pullRequests": [
      {
        "id": 123456,
        "number": 1,
        "title": "Feature: Add new functionality",
        "state": "open",
        "draft": false,
        "created_at": "2025-09-17T14:54:53Z",
        "updated_at": "2025-09-17T14:55:01Z",
        "user": {
          "login": "username",
          "avatar_url": "https://github.com/avatar.png"
        },
        "html_url": "https://github.com/owner/repo/pull/1",
        "head": { "ref": "feature-branch" },
        "base": { "ref": "main" },
        "assignees": [{"login": "reviewer1"}],
        "requested_reviewers": [{"login": "reviewer2"}]
      }
    ],
    "stats": {
      "total": 2,
      "open": 2,
      "draft": 1,
      "readyForReview": 1
    },
    "lastUpdated": "2025-09-17T15:00:00Z"
  }
}
```

### POST `/api/admin/pr-status`
Triggers a refresh of pull request data.

## Current Implementation

The current implementation uses **mock data** that reflects the actual PRs in the repository:

1. **PR #3**: "[WIP] Check Pull Request Status" - Draft status
2. **PR #2**: "Fix Next.js Image positioning warnings..." - Ready for review

## Future GitHub Integration

To enable live GitHub API integration, the following environment variables should be configured:

```env
GITHUB_ACCESS_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=muhammadfaizanhassan  
GITHUB_REPO_NAME=drinkmates
```

### Required GitHub Permissions

The GitHub token needs the following repository permissions:
- `repo` - Full repository access
- `pull_requests:read` - Read pull request data
- `metadata:read` - Read repository metadata

### GitHub API Integration Points

1. **List Pull Requests**: `GET /repos/{owner}/{repo}/pulls`
2. **Get PR Details**: `GET /repos/{owner}/{repo}/pulls/{number}`
3. **Get PR Reviews**: `GET /repos/{owner}/{repo}/pulls/{number}/reviews`
4. **Get Commit Status**: `GET /repos/{owner}/{repo}/commits/{ref}/status`

### Webhook Support (Future Enhancement)

For real-time updates, GitHub webhooks can be configured to trigger updates when:
- New PRs are created
- PRs are updated, merged, or closed
- Reviews are submitted
- PR status changes

## Security Considerations

1. **Authentication**: Only authenticated admin users can access the dashboard
2. **Authorization**: Admin role verification is required
3. **Rate Limiting**: GitHub API rate limits are respected
4. **Token Security**: GitHub tokens are stored securely in environment variables
5. **Input Validation**: All API inputs are validated and sanitized

## File Structure

```
drinkmate-main/
├── app/
│   ├── admin/
│   │   └── pr-status/
│   │       └── page.tsx              # Main PR status dashboard
│   └── api/
│       └── admin/
│           └── pr-status/
│               └── route.ts           # API endpoint for PR data
└── components/
    └── layout/
        └── AdminLayout.tsx            # Updated with PR status navigation
```

## Usage Instructions

1. **Access Dashboard**: Navigate to Admin → PR Status
2. **View PRs**: Browse the list of pull requests with detailed information
3. **Refresh Data**: Click the "Refresh" button to update PR status
4. **View on GitHub**: Click "View" button to open PR in GitHub
5. **Monitor Status**: Use color-coded indicators to quickly assess PR states

## Troubleshooting

### Common Issues

1. **Access Denied**: Ensure user has admin role
2. **Loading Issues**: Check network connectivity and API endpoint availability
3. **Data Not Updating**: Use refresh button or check API logs
4. **GitHub Integration**: Verify environment variables and token permissions

### Error Messages

- "Access denied. Admin privileges required." - User lacks admin role
- "Failed to fetch pull requests" - API connectivity or data issues
- "GitHub API rate limit exceeded" - Too many API requests (future integration)

## Development Notes

- Built with Next.js 15 and TypeScript
- Uses React hooks for state management
- Implements responsive Tailwind CSS design
- Supports both English and Arabic languages
- Follows existing codebase patterns and conventions

## Contributing

When contributing to the PR status feature:

1. Follow existing code patterns
2. Update documentation as needed
3. Test with different PR states
4. Ensure accessibility compliance
5. Verify mobile responsiveness
6. Test multilingual support