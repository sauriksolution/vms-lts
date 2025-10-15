# Error Handling Guide

This document outlines the error handling improvements made to the Intelligent VMS backend to address common runtime errors.

## Fixed Issues

### 1. MongoDB Text Search Errors
**Error**: `"text.query" cannot be empty`

**Root Cause**: Empty or whitespace-only search queries being passed to MongoDB's text search.

**Fix**: Added validation in `SearchUserQueryHandler` to check for empty queries before executing the search.

```typescript
// Before
return await this.userModel.aggregate([...]);

// After
if (!searchQuery || searchQuery.trim() === '') {
    return []; // Return empty array for empty search queries
}
return await this.userModel.aggregate([...]);
```

### 2. Null Pointer Exceptions
**Error**: `Cannot read properties of null (reading 'value')`

**Root Cause**: Database queries returning null when no records are found, followed by property access.

**Fixes Applied**:
- `GetCurfewTimeQueryHandler` (user module)
- `GetCurfewTimeQueryHandler` (restrictions module)
- `GetMaxCurfewTimePerResidentQueryHandler`

```typescript
// Before
const user = await this.userModel.findOne({ email });
return user.curfewTime;

// After
const user = await this.userModel.findOne({ email });
if (!user) {
    throw new Error(`User with email ${email} not found`);
}
return user.curfewTime || 0;
```

### 3. Undefined Property Access
**Error**: `Cannot read properties of undefined (reading 'xp')`

**Root Cause**: Array operations returning empty arrays, then accessing the first element.

**Fix**: Added array length validation in `GetMaxRequirementQueryHandler`.

```typescript
// Before
const biggest = await this.rewardModel.find().sort("-xp").limit(1);
return biggest[0].xp;

// After
const biggest = await this.rewardModel.find().sort("-xp").limit(1);
if (!biggest || biggest.length === 0) {
    return 0; // Default value when no rewards exist
}
return biggest[0].xp || 0;
```

### 4. Network Connection Errors
**Error**: `AggregateError` from network connection issues

**Fix**: Added global exception filter to handle network errors gracefully.

## New Error Handling Infrastructure

### Global Exception Filter
Location: `src/common/filters/global-exception.filter.ts`

Handles:
- MongoDB errors
- TypeError (null/undefined access)
- Network/connection errors
- HTTP exceptions

### Global Validation Pipe
Location: `src/common/pipes/validation.pipe.ts`

Features:
- Trims whitespace from string inputs
- Validates against empty strings
- Provides detailed validation error messages

## Best Practices for Developers

### 1. Always Check for Null/Undefined
```typescript
// Good
const user = await this.userModel.findOne({ id });
if (!user) {
    throw new NotFoundException('User not found');
}
return user.property;

// Bad
const user = await this.userModel.findOne({ id });
return user.property; // Can throw if user is null
```

### 2. Validate Array Access
```typescript
// Good
const results = await this.model.find().limit(1);
if (results.length === 0) {
    return defaultValue;
}
return results[0].property;

// Bad
const results = await this.model.find().limit(1);
return results[0].property; // Can throw if array is empty
```

### 3. Validate Input Parameters
```typescript
// Good
if (!searchQuery || searchQuery.trim() === '') {
    return [];
}

// Bad
// Directly using searchQuery without validation
```

### 4. Use Proper Default Values
```typescript
// Good
return user.curfewTime || 0;
return user.name || 'Unknown';

// Bad
return user.curfewTime; // Can return undefined
```

### 5. Handle Database Connection Issues
```typescript
try {
    const result = await this.model.findOne(query);
    return result;
} catch (error) {
    if (error.name === 'MongoNetworkError') {
        throw new ServiceUnavailableException('Database temporarily unavailable');
    }
    throw error;
}
```

## Testing Error Scenarios

When writing tests, ensure you cover:

1. **Null/undefined database results**
2. **Empty arrays from queries**
3. **Invalid input parameters**
4. **Network connection failures**
5. **Malformed data structures**

## Monitoring and Logging

The global exception filter logs all errors for monitoring purposes. Monitor these logs to:

1. Identify recurring error patterns
2. Detect database connectivity issues
3. Track validation failures
4. Monitor application health

## Future Improvements

1. **Circuit Breaker Pattern**: Implement for database connections
2. **Retry Logic**: Add automatic retry for transient failures
3. **Health Checks**: Implement comprehensive health monitoring
4. **Error Metrics**: Add detailed error tracking and alerting