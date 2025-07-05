# Claude Agent Instructions for Documentation System Development

## Project Overview
You are developing a revolutionary documentation system that treats documents as database tables, enabling dynamic references and automatic updates across all documentation. This system bridges the gap between traditional documentation and database management.

## Core Concept
Each document is a table in a database where:
- Every block is a table entry
- Blocks can reference other blocks/documents
- Changes propagate automatically across all references
- Documents are stored in Supabase databases

## Development Approach

### 1. Start with PLAN.md
- Review the implementation plan thoroughly
- Understand the architecture and data model
- Identify dependencies and integration points

### 2. Use TODO.md as Your Guide
- Follow the structured task list
- Mark tasks as you complete them
- Add new tasks as you discover requirements
- Keep the TODO list updated for future agents

### 3. Development Workflow
1. **Always work in Playground first**
2. **Test each component thoroughly**
3. **Duplicate to the Documentations page when ready**
4. **Ensure database integration works correctly**

### 4. Key Technical Requirements

#### Database Structure
```sql
-- Each document is a table with this structure
CREATE TABLE doc_[document_id] (
    block_id UUID PRIMARY KEY,
    block_type VARCHAR(50), -- 'text', 'code', 'reference'
    content JSONB,
    order_index INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- References table for cross-document links
CREATE TABLE doc_references (
    id UUID PRIMARY KEY,
    source_doc_id VARCHAR(255),
    source_block_id UUID,
    target_doc_id VARCHAR(255),
    target_block_id UUID,
    reference_type VARCHAR(50)
);
```

#### Block Types
- **Text Block**: Markdown content
- **Code Block**: Code with syntax highlighting
- **Reference Block**: Links to other blocks/documents

### 5. Learning from Mistakes
- Document all errors in `dev/050725_2354_project/errors.log`
- Create solution patterns in `dev/050725_2354_project/solutions.md`
- Update PLAN.md if architectural changes are needed

### 6. Git Workflow
```bash
# After completing significant features
git add .
git commit -m "feat(docs): implement [feature description]"

# Create detailed progress report
# Save to: reports/YYYYMMDD_HHMMSS_documentation_system_progress.md

# Push to dev branch
git push origin dev
```

### 7. Progress Reporting
Create comprehensive reports including:
- Completed features
- Current state of implementation
- Pending tasks with priority
- Known issues and blockers
- Next steps for continuation

### 8. Integration Points
- **Databases Page**: Allow selection of document databases
- **Supabase**: All document storage and references
- **Real-time Updates**: WebSocket for live reference updates
- **Export/Import**: Future capability for various formats

### 9. Testing Strategy
- Unit tests for block operations
- Integration tests for reference updates
- E2E tests for document creation/editing
- Performance tests for large documents

### 10. Future Enhancements
Plan for extensibility:
- Image/media blocks
- Chart/graph blocks
- PDF embedding
- Audio/video support
- External API references

## Success Criteria
- Documents function as queryable database tables
- References update automatically across all documents
- Seamless integration with existing Databases page
- Intuitive UI for document creation and editing
- Robust error handling and data integrity

## Remember
This is not just a documentation tool - it's a living, interconnected knowledge base where every piece of information can be referenced, queried, and automatically updated across the entire system.