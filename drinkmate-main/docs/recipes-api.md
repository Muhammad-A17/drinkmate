# Recipes API Documentation

## Overview
The Recipes API provides endpoints for managing drink recipes in the Drinkmate application. All endpoints require proper authentication and authorization.

## Base URL
```
/api/recipes
```

## Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Endpoints

### GET /api/recipes
Retrieve a list of recipes with optional filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of recipes per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in title and description
- `status` (optional): Filter by status (draft, published, archived)
- `featured` (optional): Filter by featured status (true, false)

**Response:**
```json
{
  "success": true,
  "recipes": [
    {
      "_id": "recipe_id",
      "title": "Recipe Title",
      "slug": "recipe-slug",
      "description": "Recipe description",
      "category": "Fruity",
      "difficulty": "Easy",
      "prepTime": 5,
      "servings": 2,
      "rating": 4.5,
      "tags": ["refreshing", "summer"],
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "image": "https://example.com/image.jpg",
      "status": "published",
      "featured": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "_id": "author_id",
        "name": "Author Name",
        "email": "author@example.com"
      }
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "hasMore": true
}
```

### POST /api/recipes
Create a new recipe.

**Request Body:**
```json
{
  "title": "Recipe Title",
  "description": "Recipe description",
  "category": "Fruity",
  "difficulty": "Easy",
  "prepTime": 5,
  "servings": 2,
  "tags": ["refreshing", "summer"],
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": ["step1", "step2"],
  "image": "https://example.com/image.jpg",
  "status": "draft",
  "featured": false
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "_id": "new_recipe_id",
    "title": "Recipe Title",
    // ... other recipe fields
  }
}
```

### GET /api/recipes/[id]
Retrieve a specific recipe by ID.

**Response:**
```json
{
  "success": true,
  "recipe": {
    "_id": "recipe_id",
    "title": "Recipe Title",
    // ... other recipe fields
  }
}
```

### PUT /api/recipes/[id]
Update an existing recipe.

**Request Body:**
```json
{
  "title": "Updated Recipe Title",
  "description": "Updated description",
  // ... other fields to update
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "_id": "recipe_id",
    "title": "Updated Recipe Title",
    // ... updated recipe fields
  }
}
```

### DELETE /api/recipes/[id]
Delete a recipe.

**Response:**
```json
{
  "success": true,
  "message": "Recipe deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Specific error message"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Recipe not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Recipe Categories
- Mocktails
- Fruity
- Citrus
- Berry
- Cola
- Seasonal
- Classic
- Healthy

## Recipe Difficulties
- Easy
- Intermediate
- Advanced

## Recipe Status
- draft
- published
- archived

## Notes
- All timestamps are in ISO 8601 format
- Image URLs should be valid and accessible
- Ingredients and instructions are arrays of strings
- Tags are used for filtering and categorization
- Featured recipes appear prominently in the UI
