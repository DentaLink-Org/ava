# TypeScript Development Guidelines for AI Platform

## Overview
This document establishes strict TypeScript development practices to prevent the type of compilation errors that occurred during the Task component development phase. These guidelines are based on lessons learned from commits 4b32e09, ca0db33, 85b2e5b, 3ed6f5b, and 326407d.

## Critical Rules to Follow

### 1. Type Safety First
- **NEVER use `as any` type assertions** - They bypass TypeScript's protection
- **Enable strict TypeScript settings** in tsconfig.json
- **Use proper type guards** for runtime validation
- **Validate all component props** before registration

```typescript
// ❌ WRONG - Bypasses type safety
componentRegistry.register(pageId, 'Component', Component as any);

// ✅ CORRECT - Proper type checking
componentRegistry.register(pageId, 'Component', Component);
```

### 2. Import/Export Consistency

#### Type vs Value Imports
- **Enums are VALUES** - Import them as regular imports, not type-only
- **Use `import type` only for pure type definitions** (interfaces, type aliases)
- **Never mix type and value imports** for the same identifier

```typescript
// ❌ WRONG - Enum imported as type but used as value
import type { TaskStatus, DependencyType } from './types';
const status = DependencyType.BLOCKING; // Runtime error!

// ✅ CORRECT - Enums imported as values
import { DependencyType, TaskStatus } from './types';
import type { Task, TaskComment } from './types';
```

#### Icon Imports
- **Always import icons explicitly** - Don't assume they exist
- **Use consistent icon naming** across components
- **Validate icon props** - Lucide icons don't accept `title` props

```typescript
// ❌ WRONG - Missing import and invalid prop
<Balance title="Workload Balance" />

// ✅ CORRECT - Proper import and usage
import { Scale } from 'lucide-react';
<Scale className="w-4 h-4" />
```

### 3. Interface Definition Standards

#### Complete Interface Definitions
- **Define all required properties** before starting implementation
- **Use consistent property naming** across related interfaces
- **Validate interface usage** against actual component implementations

```typescript
// ❌ WRONG - Inconsistent property names
interface TaskComment {
  authorId: string; // Used in interface
}
// But component expects: comment.userId

// ✅ CORRECT - Consistent naming
interface TaskComment {
  userId: string; // Matches component usage
}
```

#### Interface Maintenance
- **Update interfaces when properties change**
- **Keep interface documentation current**
- **Use automated tools to validate consistency**

### 4. Component Development Process

#### Pre-Development Checklist
1. **Define complete TypeScript interfaces** for all props
2. **Validate required vs optional properties**
3. **Check for interface consistency** across similar components
4. **Ensure all imports are available** and correctly typed

#### Development Phase
1. **Test with realistic data structures** - Not just mock data
2. **Validate component registration** with proper types
3. **Check playground configurations** match component requirements
4. **Test import/export paths** are correct

#### Post-Development Validation
1. **Run TypeScript compilation** before committing
2. **Test component rendering** with actual data
3. **Validate all icon imports** are available
4. **Check ES5 compatibility** if required

### 5. Common Error Patterns to Avoid

#### Missing Properties in Configuration
```typescript
// ❌ WRONG - Missing required props
const config = {
  // Missing 'statuses' prop that TaskCreateModal requires
};

// ✅ CORRECT - Complete configuration
const config = {
  statuses: [
    { id: "todo", name: "To Do", color: "#6b7280", position: 0, isDefault: true, isCompleted: false }
  ]
};
```

#### Property Name Mismatches
```typescript
// ❌ WRONG - Interface vs usage mismatch
interface TaskDependency {
  dependentTaskId: string;    // Interface says this
}
// But component uses: dependency.taskId

// ✅ CORRECT - Consistent naming
interface TaskDependency {
  taskId: string;            // Matches component usage
}
```

#### ES5 Compatibility Issues
```typescript
// ❌ WRONG - ES6+ features not supported in ES5
return [...new Set(allTypes)];

// ✅ CORRECT - ES5 compatible
return Array.from(new Set(allTypes));
```

### 6. Development Workflow Enforcement

#### Pre-Commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run type-check && npm run lint"
    }
  }
}
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true
  }
}
```

#### Build Process
- **Enable TypeScript strict mode** in CI/CD
- **Fail builds on type errors**
- **Include component registration validation**
- **Test playground configurations** in build process

### 7. Code Review Checklist

#### Type Safety Review
- [ ] No `as any` type assertions used
- [ ] All imports are correctly typed (type vs value)
- [ ] Component props match interface definitions
- [ ] All required properties are provided in configurations

#### Interface Consistency
- [ ] Property names match between interfaces and usage
- [ ] All required properties are defined
- [ ] Optional properties are properly marked
- [ ] Interface documentation is current

#### Component Registration
- [ ] Components registered with proper types
- [ ] All dependencies are properly imported
- [ ] Icons are imported and used correctly
- [ ] Playground configurations are complete

#### Build Validation
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] No runtime type errors
- [ ] Component renders with realistic data

## Error Prevention Strategies

### 1. Interface-First Development
1. **Define complete interfaces** before writing components
2. **Validate interfaces** against expected usage patterns
3. **Use automated tools** to check consistency
4. **Review interfaces** during code reviews

### 2. Strict Type Checking
1. **Enable all strict TypeScript options**
2. **Use type guards** for runtime validation
3. **Avoid type assertions** unless absolutely necessary
4. **Validate component props** at registration time

### 3. Comprehensive Testing
1. **Test with realistic data structures**
2. **Validate component configurations**
3. **Include integration tests** for page setups
4. **Test import/export consistency**

### 4. Automated Validation
1. **Use TypeScript in CI/CD pipelines**
2. **Add pre-commit hooks** for type checking
3. **Include build validation** for all environments
4. **Monitor for type regression** in deployments

## Tools and Resources

### Recommended Tools
- **TypeScript Strict Mode** - Enable all strict compiler options
- **ESLint TypeScript Rules** - Enforce consistent typing practices
- **Husky Pre-commit Hooks** - Validate types before commits
- **VS Code TypeScript Extensions** - Enhanced type checking in IDE

### Validation Scripts
```bash
# Type checking
npm run type-check

# Linting with type awareness
npm run lint

# Build validation
npm run build

# Component registration validation
npm run validate-components
```

## Implementation for Claude Agents

### Before Starting Any Component Development:
1. **Read and understand these guidelines**
2. **Check existing component patterns** in the codebase
3. **Validate TypeScript configuration** is strict
4. **Prepare complete interface definitions**

### During Development:
1. **Follow interface-first approach**
2. **Use proper import patterns**
3. **Validate all component props**
4. **Test with realistic data**

### Before Committing:
1. **Run TypeScript compilation**
2. **Test component rendering**
3. **Validate playground configurations**
4. **Check all imports are available**

### Code Review Focus:
1. **Type safety compliance**
2. **Interface consistency**
3. **Import/export correctness**
4. **Component registration validation**

## Conclusion

These guidelines are designed to prevent the specific TypeScript compilation errors that occurred during Task component development. By following these practices, future Claude agents can avoid the same pitfalls and deliver more robust, type-safe code from the start.

**Remember**: Type safety is not optional - it's a critical requirement for maintainable, scalable code in this AI platform.