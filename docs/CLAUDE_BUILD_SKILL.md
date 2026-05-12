# Claude Code Skill: ServiceNow Clone Builder

## Purpose

This skill file provides Claude Code with the complete context, architecture, conventions, and step-by-step instructions to iteratively build a ServiceNow clone (codename: **HDP Spark**). Reference this file at the start of every session to maintain consistency across builds.

---

## How to Use This File

1. Start a new Claude Code session
2. Reference this file: `@docs/CLAUDE_BUILD_SKILL.md`
3. Also reference the full spec: `@docs/SERVICENOW_CLONE_SPEC.md`
4. Tell Claude which module or phase to work on
5. Claude will follow the conventions, architecture, and patterns defined here

---

## Project Identity

- **Project Name**: HDP Spark
- **Tagline**: Enterprise Service Management Platform
- **What It Is**: A full-featured ServiceNow clone — metadata-driven, multi-instance, enterprise service management platform
- **Repository**: hdpspark/hdpspark

---

## Technology Stack (Mandatory)

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Language | TypeScript | 5.x (strict mode) |
| Framework | NestJS | 10.x |
| Database | PostgreSQL | 16+ |
| ORM | Prisma + custom GlideRecord abstraction | Latest |
| Cache | Redis | 7.x |
| Search | Elasticsearch | 8.x |
| Queue | BullMQ (Redis-backed) | Latest |
| File Storage | S3-compatible (MinIO for dev) | Latest |
| Auth | Passport.js (SAML, OAuth2, Local) | Latest |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x (strict mode) |
| State | Zustand | Latest |
| Routing | React Router | 6.x |
| UI Components | Custom design system (Radix primitives + Tailwind) | — |
| Form Engine | Custom metadata-driven (react-hook-form base) | — |
| Portal Widgets | Lit (Web Components) | 3.x |
| Flow Designer UI | ReactFlow | Latest |
| Rich Text | TipTap | Latest |
| Tables/Lists | TanStack Table | Latest |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Container | Docker + Docker Compose |
| Orchestration | Kubernetes (production) |
| API Gateway | Nginx (dev), Kong (production) |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |
| Logging | Pino (app) + ELK (aggregation) |

### AI/ML
| Component | Technology |
|-----------|-----------|
| GenAI | Claude API (Anthropic) |
| NLU/Chatbot | Rasa or custom with Claude |
| ML Pipeline | Python + scikit-learn microservice |
| Vector Search | pgvector (PostgreSQL extension) |

---

## Project Structure (Mandatory)

```
hdpspark/
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── src/
│   │   │   ├── core/               # Platform core (shared across all modules)
│   │   │   │   ├── database/       # Database service, migrations, GlideRecord
│   │   │   │   ├── metadata/       # Table/field/form/list metadata engine
│   │   │   │   ├── security/       # ACL engine, RBAC, encryption
│   │   │   │   ├── scripting/      # Server-side JS execution engine
│   │   │   │   ├── events/         # Event queue, async processing
│   │   │   │   ├── workflow/       # Flow Designer engine
│   │   │   │   ├── sla/            # SLA engine
│   │   │   │   ├── import/         # Import set & transform engine
│   │   │   │   ├── notifications/  # Email, push, SMS engine
│   │   │   │   ├── attachments/    # File storage service
│   │   │   │   ├── search/         # Elasticsearch integration
│   │   │   │   ├── cache/          # Redis caching layer
│   │   │   │   ├── audit/          # Audit trail
│   │   │   │   └── auth/           # Authentication (SAML, OAuth, Local, MFA)
│   │   │   ├── modules/            # Business modules
│   │   │   │   ├── itsm/           # Incident, Problem, Change, Request
│   │   │   │   ├── cmdb/           # CMDB, CI classes, relationships
│   │   │   │   ├── catalog/        # Service Catalog, items, variables
│   │   │   │   ├── knowledge/      # Knowledge Management
│   │   │   │   ├── asset/          # Asset Management (HAM, SAM)
│   │   │   │   ├── csm/            # Customer Service Management
│   │   │   │   ├── hrsd/           # HR Service Delivery
│   │   │   │   ├── secops/         # Security Operations
│   │   │   │   ├── grc/            # Governance, Risk, Compliance
│   │   │   │   ├── itom/           # IT Operations Management
│   │   │   │   ├── itbm/           # IT Business Management / SPM
│   │   │   │   └── ai/             # Virtual Agent, Predictive Intelligence
│   │   │   ├── api/                # REST API layer
│   │   │   │   ├── table/          # Table API (/api/now/table)
│   │   │   │   ├── aggregate/      # Aggregate API (/api/now/stats)
│   │   │   │   ├── attachment/     # Attachment API
│   │   │   │   ├── import/         # Import Set API
│   │   │   │   ├── cmdb/           # CMDB API
│   │   │   │   └── scripted/       # Scripted REST API engine
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Core schema
│   │   │   └── migrations/
│   │   ├── test/
│   │   └── package.json
│   ├── web/                        # React frontend (Next Experience equivalent)
│   │   ├── src/
│   │   │   ├── core/               # Platform core UI
│   │   │   │   ├── shell/          # Navigation shell (unified nav)
│   │   │   │   ├── form-engine/    # Metadata-driven form renderer
│   │   │   │   ├── list-engine/    # Metadata-driven list renderer
│   │   │   │   ├── design-system/  # Custom components (buttons, inputs, etc.)
│   │   │   │   ├── auth/           # Login, SSO, MFA flows
│   │   │   │   └── api-client/     # REST API client
│   │   │   ├── workspaces/         # Agent workspaces
│   │   │   │   ├── itsm/
│   │   │   │   ├── csm/
│   │   │   │   ├── hrsd/
│   │   │   │   └── secops/
│   │   │   ├── admin/              # Admin console
│   │   │   │   ├── tables/         # Table administration
│   │   │   │   ├── forms/          # Form designer
│   │   │   │   ├── acls/           # ACL management
│   │   │   │   ├── scripts/        # Script editor (Monaco)
│   │   │   │   ├── flows/          # Flow Designer UI
│   │   │   │   ├── ui-builder/     # UI Builder
│   │   │   │   └── properties/     # System properties
│   │   │   ├── reporting/          # Reports & dashboards
│   │   │   └── App.tsx
│   │   └── package.json
│   ├── portal/                     # Public portal (Web Components / Lit)
│   │   ├── src/
│   │   │   ├── widgets/            # Portal widgets
│   │   │   ├── pages/              # Portal pages
│   │   │   └── themes/
│   │   └── package.json
│   └── mobile/                     # React Native mobile app
│       ├── src/
│       └── package.json
├── packages/
│   ├── shared/                     # Shared types, constants, utilities
│   │   ├── src/
│   │   │   ├── types/              # Shared TypeScript types
│   │   │   ├── constants/          # Field types, states, priorities
│   │   │   └── utils/              # Shared utilities
│   │   └── package.json
│   ├── glide-api/                  # GlideRecord/GlideSystem client SDK
│   │   ├── src/
│   │   └── package.json
│   └── design-tokens/              # Design tokens (colors, spacing, typography)
│       ├── src/
│       └── package.json
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── docker-compose.yml
│   ├── k8s/                        # Kubernetes manifests
│   └── scripts/                    # Setup, seed, migration scripts
├── docs/
│   ├── SERVICENOW_CLONE_SPEC.md    # Full specification
│   ├── CLAUDE_BUILD_SKILL.md       # This file
│   └── architecture/               # Architecture diagrams
├── turbo.json                      # Turborepo config
├── package.json                    # Root workspace
└── tsconfig.base.json              # Shared TS config
```

---

## Architecture Principles (Follow Strictly)

### 1. Metadata-Driven Everything

Every table, field, form, list, ACL, and UI element is defined as a **record in a system table**. Never hardcode schemas.

```typescript
// WRONG — hardcoded schema
@Entity()
class Incident {
  @Column() shortDescription: string;
  @Column() priority: number;
}

// RIGHT — metadata-driven
// Tables defined in sys_db_object records
// Fields defined in sys_dictionary records
// The platform reads metadata at runtime to build queries, forms, ACLs
```

### 2. sys_id as Universal Primary Key

Every record in every table uses a 32-character hex GUID as its primary key. Never use auto-increment integers.

```typescript
// Generate sys_id
import { randomBytes } from 'crypto';
function generateSysId(): string {
  return randomBytes(16).toString('hex'); // 32 hex chars
}
```

### 3. Table Inheritance via Physical Joins

Parent tables store shared fields. Child tables store only unique fields + matching sys_id. Queries auto-join.

```sql
-- Physical storage
CREATE TABLE task (
  sys_id VARCHAR(32) PRIMARY KEY,
  sys_class_name VARCHAR(80) NOT NULL,
  number VARCHAR(40),
  short_description TEXT,
  state INTEGER,
  priority INTEGER,
  assigned_to VARCHAR(32) REFERENCES sys_user(sys_id),
  ...
);

CREATE TABLE incident (
  sys_id VARCHAR(32) PRIMARY KEY REFERENCES task(sys_id),
  caller_id VARCHAR(32) REFERENCES sys_user(sys_id),
  category VARCHAR(80),
  impact INTEGER,
  urgency INTEGER,
  ...
);

-- Query incident = auto-join task + incident
SELECT t.*, i.*
FROM task t
JOIN incident i ON t.sys_id = i.sys_id
WHERE t.sys_class_name = 'incident';
```

### 4. Default-Deny Security

Non-admin users see nothing unless an ACL explicitly grants access. ACL evaluation runs on every query.

### 5. GlideRecord Abstraction

All data access goes through the GlideRecord API. No raw SQL in business logic.

```typescript
// Server-side API
const gr = new GlideRecord('incident');
gr.addQuery('priority', 1);
gr.addQuery('active', true);
gr.query();
while (gr.next()) {
  const number = gr.getValue('number');
  gr.setValue('state', 2);
  gr.update();
}
```

### 6. Event-Driven Processing

Business rules fire on CRUD. Events go to async queue. Notifications bind to events.

```
Record Insert → Before Business Rules → DB Write → After Business Rules → Event Queue
                                                                              ↓
                                                              Notifications, Script Actions,
                                                              Async Business Rules
```

---

## Build Phases (Iterative)

### Phase 1: Platform Core (Foundation)

**Goal**: Build the metadata-driven engine that everything else runs on.

**Tasks**:
1. **Project scaffolding**: Turborepo monorepo, NestJS API, React web app, Docker Compose (PostgreSQL, Redis, Elasticsearch, MinIO)
2. **sys_id generator**: 32-char hex GUID utility
3. **Metadata engine**:
   - `sys_db_object` table and CRUD API (table registry)
   - `sys_dictionary` table and CRUD API (field registry)
   - `sys_choice` table (choice lists)
   - Dynamic table creation from metadata (DDL generation)
   - Dynamic field addition/modification
4. **GlideRecord implementation**:
   - Query builder with encoded query support
   - All operators: =, !=, >, <, CONTAINS, IN, ISEMPTY, etc.
   - Insert, update, delete, deleteMultiple
   - Pagination (setLimit, chooseWindow)
   - Order by, group by
   - GlideAggregate (COUNT, SUM, AVG, MIN, MAX)
5. **Table inheritance**:
   - Physical join model (parent stores shared fields, child stores unique)
   - sys_class_name discriminator
   - Auto-join on queries
   - Inheritance of business rules and ACLs
6. **Table API**:
   - GET /api/now/table/{table} (query with sysparm_query, sysparm_fields, sysparm_limit, sysparm_offset)
   - GET /api/now/table/{table}/{sys_id}
   - POST /api/now/table/{table}
   - PUT /api/now/table/{table}/{sys_id}
   - PATCH /api/now/table/{table}/{sys_id}
   - DELETE /api/now/table/{table}/{sys_id}
7. **User/Group/Role tables**: sys_user, sys_user_group, sys_user_grmember, sys_user_role, sys_user_has_role, sys_group_has_role
8. **Authentication**: Local auth with bcrypt, JWT sessions, basic RBAC middleware

**Acceptance Criteria**:
- Can create tables and fields via API
- Can CRUD records on dynamic tables via Table API
- Table inheritance works (create incident inheriting from task)
- Users can log in and roles are enforced at basic level
- GlideRecord query builder works with encoded queries

---

### Phase 2: Security & ACL Engine

**Goal**: Implement the full default-deny ACL system.

**Tasks**:
1. **ACL table** (`sys_security_acl`): type, operation, table, field, roles, condition, script
2. **ACL evaluation engine**:
   - Table-level, record-level, field-level ACLs
   - Operations: read, write, create, delete
   - Evaluate roles → conditions → scripts (in order)
   - More specific ACLs override general (field > record > table)
   - Admin role bypasses all ACLs
3. **ACL middleware**: Intercept all GlideRecord queries and Table API calls
4. **GlideRecordSecure**: ACL-enforcing variant
5. **Role inheritance**: sys_user_role_contains (roles containing other roles)
6. **Group-based roles**: Inherit roles from group membership

**Acceptance Criteria**:
- Non-admin users blocked from everything by default
- ACLs correctly gate read/write/create/delete at table and field level
- Role inheritance works
- Admin bypasses all ACLs

---

### Phase 3: UI Core — Forms, Lists & Navigation

**Goal**: Dynamic, metadata-driven UI rendering.

**Tasks**:
1. **Navigation shell**: Top bar with menu, favorites, history, global search, user menu
2. **Application navigator**: Left sidebar with module tree
3. **Form engine**:
   - Read sys_ui_form for layout (sections, fields)
   - Read sys_dictionary for field types and constraints
   - Render appropriate input for each field type (string, integer, reference, choice, date, boolean, journal, HTML, etc.)
   - Reference field with auto-complete lookup
   - Journal/activity stream (work notes + comments)
   - Related lists below form
   - Form actions (buttons from sys_ui_action)
4. **List engine**:
   - Read sys_ui_list for column definitions
   - Encoded query filtering (URL-based)
   - Column sorting, grouping
   - Pagination
   - Inline editing
   - Export (CSV, Excel)
   - Breadcrumb filter display
5. **sys_ui_form** and **sys_ui_list** admin pages for configuration
6. **Responsive layout** with Tailwind

**Acceptance Criteria**:
- Forms render dynamically from metadata (no hardcoded forms)
- Changing sys_dictionary or sys_ui_form changes the rendered form
- Lists show records with filtering, sorting, pagination
- Reference fields auto-complete
- Journal fields render activity stream

---

### Phase 4: Scripting Engine & Business Rules

**Goal**: Server-side JavaScript execution engine.

**Tasks**:
1. **Script execution sandbox** (vm2 or isolated-vm):
   - Execute JavaScript strings safely in sandbox
   - Inject GlideRecord, GlideSystem (gs), current, previous into sandbox scope
   - Timeout protection and memory limits
2. **Business Rules** (`sys_script`):
   - Before/After/Async/Display timing
   - Trigger on insert/update/delete/query
   - Table and condition matching
   - Order-based execution sequence
   - Access to `current`, `previous`, `g_scratchpad`
3. **Script Includes** (`sys_script_include`):
   - On-demand loading
   - Client-callable via API (GlideAjax equivalent)
   - Application scoping
4. **Event queue** (`sysevent`):
   - gs.eventQueue() implementation
   - BullMQ-backed async processing
   - Event → Notification / Script Action binding
5. **Scheduled Jobs** (`sys_trigger`):
   - Cron-based scheduling
   - Full server-side API access in job scripts

**Acceptance Criteria**:
- Business rules execute on record CRUD (before/after/async)
- Scripts have access to GlideRecord and GlideSystem
- Script Includes are callable from other scripts
- Events fire asynchronously and trigger notifications
- Scheduled jobs run on time

---

### Phase 5: Client-Side Scripting & UI Policies

**Goal**: Dynamic form behavior in the browser.

**Tasks**:
1. **Client Scripts** (`sys_script_client`):
   - onLoad, onChange, onSubmit, onCellEdit
   - g_form API in browser (setValue, setVisible, setMandatory, etc.)
   - g_scratchpad data from display business rules
2. **UI Policies** (`sys_ui_policy`):
   - No-code rules: visible/hidden, mandatory, read-only
   - Condition builder
   - Reverse-if-false behavior
   - Execution before client scripts
3. **UI Actions** (`sys_ui_action`):
   - Form buttons, list buttons, context menus
   - Client-side and/or server-side execution
   - Conditional visibility
4. **GlideAjax**: Client-to-server async calls to Script Includes

**Acceptance Criteria**:
- UI Policies dynamically show/hide/mandate fields
- Client scripts fire on form load and field change
- UI Actions appear as configurable buttons
- GlideAjax calls work from browser to server

---

### Phase 6: Flow Designer & Workflow Engine

**Goal**: Visual no-code workflow builder.

**Tasks**:
1. **Flow data model**: flows, triggers, actions, subflows, conditions, data pills
2. **Flow execution engine**:
   - Trigger evaluation (record-based, schedule-based, manual)
   - Action execution (create/update/delete record, send notification, approvals, wait, log)
   - Logic elements (if/else, loops, parallel, try/catch)
   - Data pill resolution
   - Subflow invocation
   - Error handling
3. **Flow Designer UI** (ReactFlow-based):
   - Drag-and-drop flow builder
   - Trigger configuration panel
   - Action configuration panels
   - Data pill picker
   - Flow testing and execution history
4. **Approval engine**:
   - sysapproval_approver table
   - Approval patterns (anyone, everyone, first response)
   - Multi-level approvals
   - Delegation

**Acceptance Criteria**:
- Can create flows visually with triggers, actions, conditions
- Flows execute when trigger conditions are met
- Approvals work with email notifications
- Flow execution history shows each step

---

### Phase 7: ITSM Modules

**Goal**: Incident, Problem, Change, Request, Knowledge, SLA, Asset Management.

**Tasks**:
1. **Incident Management**: table, fields, states, priority matrix, assignment rules, major incident workflow
2. **Problem Management**: table, states, RCA workflow, KEDB, workaround communication
3. **Change Management**: table, types (standard/normal/emergency), CAB, conflict detection, risk assessment
4. **Service Catalog**: catalogs, categories, items, variables, variable sets, order guides, fulfillment flows
5. **Knowledge Management**: knowledge bases, articles, lifecycle, feedback, search integration
6. **SLA Engine**: definitions, start/pause/stop/reset conditions, timer, escalation flows, breach tracking
7. **Asset Management**: assets, hardware, software licenses, lifecycle, stockroom
8. **Agent Workspace**: multi-pane layout, tabbed interface, embedded analytics

**Acceptance Criteria**:
- Full incident lifecycle from creation to closure
- Problems link to incidents with workaround flow
- Changes go through CAB approval
- Service Catalog ordering works end-to-end
- SLAs track and breach correctly
- Knowledge articles are searchable and integrated

---

### Phase 8: CMDB

**Goal**: Configuration Management Database with class hierarchy and relationships.

**Tasks**:
1. **CI class hierarchy**: cmdb_ci base with extensions (server, application, service, etc.)
2. **CI relationships**: cmdb_rel_ci with typed relationships
3. **CI Class Manager**: admin interface for class hierarchy
4. **CSDM implementation**: Business Services, Application Services, Technical Services
5. **Discovery integration**: API endpoints for automated CI population
6. **Service Mapping**: visual dependency maps

**Acceptance Criteria**:
- CI classes extend with inheritance
- Relationships between CIs are queryable
- Service maps show dependency chains

---

### Phase 9: Service Portal

**Goal**: Public-facing self-service portal.

**Tasks**:
1. **Portal engine**: portal definitions, pages, themes
2. **Widget system** (Lit Web Components): server data + client rendering + scoped CSS
3. **Pre-built widgets**: search, knowledge, catalog, my requests, my approvals
4. **Portal designer**: drag-and-drop page layout
5. **Theming**: CSS variable-based themes

**Acceptance Criteria**:
- End-users can browse catalog, read KB, submit requests, track status
- Portal is customizable via designer
- Widgets are isolated and reusable

---

### Phase 10: CSM, HRSD, SecOps, GRC

**Goal**: Extend platform with additional business modules.

**Tasks**:
1. **CSM**: Cases, accounts, contacts, entitlements, field service, omni-channel
2. **HRSD**: HR cases, employee center, lifecycle events, document management
3. **SecOps**: Security incidents, vulnerability response, threat intelligence
4. **GRC**: Policies, risk register, controls, audit management, compliance

Each module follows the same pattern:
- Define tables (extending task where applicable)
- Define fields in sys_dictionary
- Configure forms and lists
- Add business rules and flows
- Create workspace UI

---

### Phase 11: Reporting & Analytics

**Goal**: Full reporting and dashboard engine.

**Tasks**:
1. **Report engine**: Query any table, aggregate, group, filter
2. **Chart rendering**: bar, line, pie, donut, area, gauge, pivot, etc.
3. **Dashboard builder**: drag-and-drop widget layout
4. **Performance Analytics**: KPIs, indicators, scorecards, time series, breakdowns
5. **Scheduled reports**: email distribution on schedule
6. **Drill-down**: click chart to see underlying records

---

### Phase 12: AI & Virtual Agent

**Goal**: Chatbot, GenAI, and predictive intelligence.

**Tasks**:
1. **Virtual Agent**: topic flows, NLU, intent recognition, entity extraction, multi-channel
2. **Now Assist equivalent**: summarization, content generation, code generation via Claude API
3. **Predictive Intelligence**: classification, similarity, assignment prediction
4. **AI Search**: semantic search with pgvector

---

### Phase 13: Notifications, Import, & Integration

**Goal**: Complete notification system and data integration.

**Tasks**:
1. **Email engine**: SMTP outbound with templates, POP3/IMAP inbound with watermark tracking
2. **Import Sets**: staging tables, transform maps, data sources, LDAP sync
3. **Integration Hub**: spoke framework, connection/credential aliases
4. **MID Server equivalent**: lightweight bridge agent for on-premise connectivity

---

### Phase 14: Instance Management & Deployment

**Goal**: Multi-instance management and change promotion.

**Tasks**:
1. **Update Sets**: capture configuration changes as JSON/XML, promote between instances
2. **Application scoping**: namespace isolation, cross-scope access control
3. **ATF equivalent**: automated test framework with server and UI test steps
4. **CI/CD pipeline**: GitHub Actions for build, test, promote

---

## Coding Conventions

### General
- TypeScript strict mode everywhere
- ESLint + Prettier enforced
- No `any` types — use proper typing or `unknown` with type guards
- Prefer `const` over `let`, never `var`
- Use early returns to reduce nesting
- Functions should do one thing
- Max file length: ~300 lines (split if larger)

### Naming
- **Files**: kebab-case (`glide-record.service.ts`)
- **Classes**: PascalCase (`GlideRecordService`)
- **Interfaces**: PascalCase with `I` prefix only for disambiguation (`GlideRecord`)
- **Functions/Methods**: camelCase (`addQuery`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)
- **Database tables**: snake_case (`sys_user_has_role`)
- **Database columns**: snake_case (`short_description`)
- **API routes**: kebab-case (`/api/now/table/incident`)
- **React components**: PascalCase (`FormRenderer.tsx`)

### Backend (NestJS)
- One module per domain area
- Services contain business logic, controllers handle HTTP
- Use NestJS dependency injection
- DTOs for all API inputs with class-validator
- Interceptors for response formatting
- Guards for authentication and authorization
- Custom decorators for common patterns

### Frontend (React)
- Functional components with hooks
- Zustand for global state, React Query for server state
- Custom hooks for reusable logic (`useGlideRecord`, `useForm`, `useACL`)
- Component composition over inheritance
- Lazy loading for routes and heavy components

### Database
- All tables have: `sys_id` (PK), `sys_created_on`, `sys_updated_on`, `sys_created_by`, `sys_updated_by`, `sys_mod_count`
- Never use auto-increment IDs
- All foreign keys reference sys_id
- Index frequently queried columns
- Use database transactions for multi-table operations

### Testing
- Unit tests for all services and utilities
- Integration tests for API endpoints
- E2E tests for critical workflows
- Test naming: `describe('GlideRecord')` → `it('should query records with encoded query')`
- Minimum 80% coverage for core modules

### Git
- Branch naming: `feature/{module}-{description}`, `fix/{description}`, `chore/{description}`
- Commit messages: conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`)
- PR per feature/module
- Squash merge to main

---

## Prompt Templates

### Starting a New Module

```
I'm building HDP Spark, a ServiceNow clone. Reference @docs/SERVICENOW_CLONE_SPEC.md
and @docs/CLAUDE_BUILD_SKILL.md for full context.

I need to implement [MODULE NAME] (Phase [N]).

Current state: [describe what's already built]

Please implement the following:
1. [specific task 1]
2. [specific task 2]
3. [specific task 3]

Follow the project structure, coding conventions, and architecture
patterns defined in CLAUDE_BUILD_SKILL.md.
```

### Continuing a Module

```
I'm continuing work on HDP Spark. Reference @docs/CLAUDE_BUILD_SKILL.md.

Module: [MODULE NAME]
What's done: [list completed items]
What's next: [list remaining items]

Please implement [specific next task]. Make sure it integrates with
the existing [related components].
```

### Fixing Issues

```
I'm working on HDP Spark. Reference @docs/CLAUDE_BUILD_SKILL.md.

There's an issue with [component]:
- Expected behavior: [what should happen]
- Actual behavior: [what happens]
- Error message: [if any]

The relevant code is in [file path]. Please diagnose and fix.
```

### Adding a New Table/Module

```
I'm extending HDP Spark with a new table/module.

Table: [table_name]
Extends: [parent_table or "none"]
Fields:
- field_name (type) — description
- field_name (type) — description

Please:
1. Add the sys_db_object and sys_dictionary records
2. Create the physical table migration
3. Add form and list configurations
4. Add appropriate ACLs
5. Add any business rules needed
6. Create the API endpoints
7. Create the UI components (form + list views)
```

---

## Key Implementation Notes

### GlideRecord Must Be the Only Data Access Layer
Every query, insert, update, delete MUST go through GlideRecord. This ensures:
- ACLs are enforced
- Business rules fire
- Audit trail is maintained
- Events are triggered

### Metadata Changes = Schema Changes
When a record is added to `sys_dictionary` (new field), the platform must:
1. Generate and execute the DDL (`ALTER TABLE ADD COLUMN`)
2. Invalidate cached metadata
3. Update form/list configurations if auto-configured

### Business Rule Execution Order
```
Before BR (order 100) → Before BR (order 200) → DB Write →
After BR (order 100) → After BR (order 200) → Event Queue →
Async BR (order 100) → Async BR (order 200)
```

### ACL Evaluation Order
```
1. Is user admin? → ALLOW (bypass all)
2. Check table-level ACL for operation → DENY if no match
3. Check record-level conditions → DENY if conditions fail
4. Check field-level ACLs → Hide/protect specific fields
5. For each ACL: evaluate Roles → Conditions → Scripts (all must pass)
```

### Journal Fields Are Special
Journal fields (work_notes, comments) are NOT stored in the record table. They are stored in `sys_journal_field` with a reference to the record's sys_id and table name. The Activity Formatter reads from sys_journal_field + sys_audit + sys_history_line.

### Encoded Query Syntax
```
field=value                    — equals
field!=value                   — not equals
field>value                    — greater than
fieldCONTAINSvalue             — contains
fieldSTARTSWITHvalue           — starts with
fieldIN1,2,3                   — in list
fieldISEMPTY                   — is empty
fieldISNOTEMPTY                — is not empty
condition1^condition2           — AND
condition1^ORcondition2         — OR
condition1^NQcondition2         — new query (AND block)
^ORDERBY field                 — order ascending
^ORDERBYDESCfield              — order descending
```

---

## Quick Reference: ServiceNow → HDP Spark Mapping

| ServiceNow | HDP Spark Equivalent |
|------------|---------------------|
| Glide Engine (Java/Rhino) | Node.js/TypeScript + isolated-vm |
| MariaDB/RaptorDB | PostgreSQL |
| GlideRecord | Custom GlideRecord class |
| Jelly Templates | React components |
| Service Portal (AngularJS) | Lit Web Components portal |
| Next Experience (Seismic) | React + Radix + Tailwind |
| Flow Designer | ReactFlow-based visual builder |
| MID Server | Lightweight Node.js bridge agent |
| Update Sets | JSON-based config snapshots |
| ATF | Jest + Playwright test framework |
| Now Assist | Claude API integration |
| Predictive Intelligence | scikit-learn microservice |

---

*Use this file as the single source of truth for building HDP Spark. Reference it at the start of every Claude Code session.*
