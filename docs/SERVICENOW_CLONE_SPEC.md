# ServiceNow Clone - Complete Platform Specification

## Project: HDP Spark — Enterprise Service Management Platform

**Version:** 1.0
**Date:** 2026-05-12

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Architecture](#2-platform-architecture)
3. [Database & Data Model](#3-database--data-model)
4. [Security Architecture](#4-security-architecture)
5. [User Interface Layer](#5-user-interface-layer)
6. [Workflow & Automation Engine](#6-workflow--automation-engine)
7. [Server-Side Scripting Engine](#7-server-side-scripting-engine)
8. [Client-Side Scripting](#8-client-side-scripting)
9. [REST API & Integration Layer](#9-rest-api--integration-layer)
10. [ITSM Modules](#10-itsm-modules)
11. [ITOM Modules](#11-itom-modules)
12. [ITBM / Strategic Portfolio Management](#12-itbm--strategic-portfolio-management)
13. [Customer Service Management](#13-customer-service-management)
14. [HR Service Delivery](#14-hr-service-delivery)
15. [Security Operations](#15-security-operations)
16. [Governance Risk & Compliance](#16-governance-risk--compliance)
17. [App Engine & Low-Code Platform](#17-app-engine--low-code-platform)
18. [AI & Virtual Agent](#18-ai--virtual-agent)
19. [Reporting & Analytics](#19-reporting--analytics)
20. [Notification System](#20-notification-system)
21. [Import & Data Integration](#21-import--data-integration)
22. [Instance Management & Deployment](#22-instance-management--deployment)
23. [Mobile Platform](#23-mobile-platform)
24. [Recommended Technology Stack](#24-recommended-technology-stack)

---

## 1. Executive Summary

This specification defines a comprehensive enterprise service management platform modeled after ServiceNow. The platform is a **metadata-driven, single-tenant, multi-instance** cloud application providing IT Service Management (ITSM), IT Operations Management (ITOM), Customer Service Management (CSM), HR Service Delivery (HRSD), Security Operations (SecOps), Governance Risk & Compliance (GRC), and a low-code application development engine.

### Core Design Principles

1. **Metadata-Driven Platform** — Tables, fields, forms, lists, ACLs, scripts, and workflows are all records in system tables. The schema is self-describing.
2. **Single System of Record** — One unified relational database per instance correlating all business services and processes.
3. **Default-Deny Security** — Users are blocked from accessing any object unless explicitly granted by ACL rules.
4. **Table Inheritance** — Child tables inherit fields, business rules, and ACLs from parent tables via physical joins.
5. **Event-Driven Architecture** — Business Rules trigger on CRUD operations; events fire asynchronously; notifications bind to events.
6. **Configuration Over Code** — Prefer declarative configuration (UI Policies, Flow Designer) over imperative scripting.
7. **Multi-Instance Isolation** — Each customer gets a fully isolated stack (database, application server, job queues).

---

## 2. Platform Architecture

### 2.1 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Next Exp │  │ Service  │  │  Agent   │  │ Mobile  │ │
│  │ (WebComp)│  │ Portal   │  │Workspace │  │  App    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────┤
│                  APPLICATION LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Script   │  │  Flow    │  │  REST    │  │  Event  │ │
│  │ Engine   │  │ Designer │  │  API     │  │  Queue  │ │
│  │(JS/Rhino)│  │          │  │          │  │         │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Business │  │   ACL    │  │ SLA      │  │ Import  │ │
│  │ Rules    │  │ Engine   │  │ Engine   │  │ Engine  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────┤
│                     DATA LAYER                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │        PostgreSQL (Single System of Record)       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
│  │  │ Metadata │  │ App Data │  │     CMDB      │  │   │
│  │  │ Tables   │  │ Tables   │  │               │  │   │
│  │  └──────────┘  └──────────┘  └───────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Instance Architecture

Each customer instance consists of:

| Component | Description |
|-----------|-------------|
| **Dedicated Database** | Isolated PostgreSQL database |
| **Application Nodes** | Stateless app server(s) behind load balancer |
| **Job Scheduler** | Async event processing, scheduled jobs, SLA engine |
| **File Storage** | Object storage for attachments |
| **Cache Layer** | Redis for session, metadata, and query caching |
| **Search Index** | Elasticsearch for full-text search |

### 2.3 Instance Types

| Instance | Purpose |
|----------|---------|
| **Production (PROD)** | Live environment |
| **Test / Staging** | UAT and staging |
| **Development (DEV)** | Customization and development |
| **Sandbox** | Experimentation |

### 2.4 High Availability

- Active-active application nodes behind a load balancer
- Database replication (primary read-write, standby read-only)
- Automated failover with health checks
- RPO: 1 hour, RTO: 2 hours
- Full backups every 7 days, differential backups every 24 hours

---

## 3. Database & Data Model

### 3.1 The sys_id Concept

Every record in every table has a **sys_id** — a 32-character hexadecimal string representing a 128-bit GUID. This is the universal primary key:

- Generated at insert time (random, non-sequential)
- Guaranteed unique across all tables and all instances
- Used for all foreign key references and cross-table relationships
- Format: `[0-9a-f]{32}` (e.g., `a1b2c3d4e5f60718293a4b5c6d7e8f90`)

### 3.2 Metadata-Driven Schema

The platform schema is self-describing via system tables:

| System Table | Purpose |
|-------------|---------|
| `sys_db_object` | Table registry — every table has a row defining name, label, parent table, extensibility |
| `sys_dictionary` | Field registry — every field on every table has a row defining type, length, default, reference target, mandatory, read-only |
| `sys_choice` | Choice list values for dropdown fields |
| `sys_glide_object` | Field type definitions |
| `sys_documentation` | Field help text and labels |
| `sys_ui_form` | Form layout definitions (sections, fields per section) |
| `sys_ui_list` | List view column definitions |
| `sys_ui_related_list` | Related list configurations |
| `sys_properties` | System properties (key-value configuration) |

### 3.3 Table Inheritance Model

Tables use **single-table inheritance with physical joins**:

```
Parent Table: task
  Fields: sys_id, number, short_description, description, state,
          priority, assigned_to, assignment_group, opened_by,
          opened_at, closed_by, closed_at, work_notes, comments, ...

Child Table: incident (extends task)
  Additional Fields: caller_id, category, subcategory, impact,
                     urgency, resolution_code, resolved_by, ...

Child Table: change_request (extends task)
  Additional Fields: type, risk, cab_required, implementation_plan,
                     backout_plan, start_date, end_date, ...
```

**Physical Storage**: The parent table (`task`) stores all shared fields. The child table (`incident`) stores only its unique fields plus a matching `sys_id`. Queries join automatically.

**Discriminator**: The `sys_class_name` field on the parent table identifies which child table a record belongs to. Querying `incident` adds an implicit filter `sys_class_name = 'incident'`.

**Inheritance Cascade**: Child tables inherit:
- All fields from parent
- Business Rules (if marked inheritable)
- ACLs
- Client Scripts
- UI Policies
- UI Actions (if marked inheritable)

### 3.4 Core Table Hierarchy

```
task (base)
├── incident
├── problem
├── change_request
│   ├── change_request_normal
│   └── change_request_emergency
├── sc_request
├── sc_req_item
├── sc_task
├── hr_case
├── sn_customerservice_case
├── sn_si_incident (security incident)
└── kb_submission

cmdb
└── cmdb_ci (base CI)
    ├── cmdb_ci_computer
    │   ├── cmdb_ci_server
    │   │   ├── cmdb_ci_win_server
    │   │   └── cmdb_ci_linux_server
    │   └── cmdb_ci_vm_instance
    ├── cmdb_ci_appl (application)
    ├── cmdb_ci_service
    │   └── cmdb_ci_business_service
    ├── cmdb_ci_db_instance
    └── cmdb_ci_network_adapter
```

### 3.5 Field Types

| Type | Storage | Description |
|------|---------|-------------|
| String | VARCHAR | Short text (configurable max length) |
| Integer | INT | Whole numbers |
| Float | FLOAT | Decimal numbers |
| Boolean | BOOLEAN | True/false |
| Date/Time | TIMESTAMP | Date with time |
| Date | DATE | Date only |
| Duration | BIGINT | Time duration in milliseconds |
| Reference | VARCHAR(32) | Foreign key storing target sys_id |
| Glide List | TEXT | Comma-separated sys_id values (lightweight M:M) |
| Journal | — | Stored in `sys_journal_field` table, not inline |
| Journal Input | — | Write-only journal (work notes, comments) |
| Choice | VARCHAR | Value constrained by `sys_choice` entries |
| Document ID | VARCHAR(32) + VARCHAR(80) | Polymorphic reference (table name + sys_id) |
| Conditions | TEXT | Encoded query string |
| HTML | TEXT | Rich text/HTML content |
| URL | VARCHAR | Web address |
| Email | VARCHAR | Email address |
| Password2 | VARCHAR | Encrypted password field |
| Attachment | — | Stored in `sys_attachment` + `sys_attachment_doc` |

### 3.6 Relationship Types

1. **Reference Fields**: FK pointing to another table's sys_id. Most common.
2. **Glide List Fields**: Comma-separated sys_ids for lightweight M:M.
3. **Many-to-Many Tables**: Dedicated junction tables with two reference fields.
4. **Document ID Fields**: Polymorphic references that store table name + sys_id.
5. **Related Lists**: UI construct showing child records referencing the current record.

### 3.7 CMDB (Configuration Management Database)

**Core Tables**:

| Table | Purpose |
|-------|---------|
| `cmdb` | Root CMDB table |
| `cmdb_ci` | Base Configuration Item — all CIs extend this |
| `cmdb_rel_ci` | CI-to-CI relationships (parent, child, type) |
| `cmdb_rel_type` | Relationship type definitions |

**Relationship Types** (stored in `cmdb_rel_type`):

- `Depends on :: Used by`
- `Runs on :: Runs`
- `Hosted on :: Hosts`
- `Contains :: Contained by`
- `Members :: Member of`
- `Connects to :: Connected by`
- `Managed by :: Manages`

**Common Service Data Model (CSDM)**: Standardized framework for modeling services:
- Business Services (user-facing)
- Application Services (operational view)
- Technical Services (infrastructure)

### 3.8 Core User/Group/Role Tables

| Table | Purpose |
|-------|---------|
| `sys_user` | User records |
| `sys_user_group` | Group records |
| `sys_user_grmember` | User-to-group membership (M:M) |
| `sys_user_role` | Role definitions |
| `sys_user_has_role` | User-to-role assignments (M:M) |
| `sys_group_has_role` | Group-to-role assignments (M:M) |
| `sys_user_role_contains` | Role inheritance/containment |

### 3.9 Data Lifecycle Management

- **Table Rotation**: Split high-volume tables into time-based shards using `sys_created_on`
- **Data Archiving**: Move inactive records to archive tables (up to 80% reduction)
- **Table Cleaner**: Automated cleanup based on configurable retention rules
- **Performance Threshold**: Tables should be managed carefully beyond 8M+ records

---

## 4. Security Architecture

### 4.1 Default-Deny Model

Non-administrator users are **blocked from accessing any object** unless a matching ACL rule explicitly grants access.

### 4.2 Role-Based Access Control (RBAC)

**Role Hierarchy**:
- Roles defined in `sys_user_role`
- Roles can contain other roles (inheritance via `sys_user_role_contains`)
- Users receive roles directly or through group membership
- The `admin` role bypasses all ACL checks

**Key Platform Roles**:

| Role | Description |
|------|-------------|
| `admin` | Full system access, bypasses ACLs |
| `itil` | IT service management user |
| `approver_user` | Approval capabilities |
| `catalog_admin` | Service Catalog administration |
| `knowledge` | Knowledge base contributor |
| `asset` | Asset management user |
| `security_admin` | Security operations |

### 4.3 Access Control Lists (ACLs)

ACLs define **who can do what to which data**.

**ACL Levels**:

| Level | Scope | Description |
|-------|-------|-------------|
| Table-level | Entire table | Controls CRUD on all records |
| Record-level | Individual records | Applies conditions to filter which records are accessible |
| Field-level | Specific field | Controls read/write on individual fields |

**ACL Operations**: `read`, `write`, `create`, `delete`, `execute`

**ACL Evaluation Order**: More specific ACLs take precedence (field > record > table). Deny rules always override allow rules.

**ACL Condition Components** (ALL must evaluate true):

1. **Roles** — Required user roles (fastest, cached in memory)
2. **Conditions** — Record-based field conditions (e.g., `active=true`)
3. **Script** — Custom JavaScript returning true/false (slowest)

**ACL Inheritance**: ACLs on parent tables cascade to child tables unless overridden.

### 4.4 Encryption

**Three Layers**:

1. **Platform Encryption (Database-Level)**: AES-256 for all data at rest with multi-layered key hierarchy (Root Key → Instance Root Key → Instance Key Encryption Key → Customer Data Encryption Key)
2. **Column-Level Encryption**: AES-128/256 for specific fields. Tied to encryption contexts and user roles.
3. **Edge Encryption**: Client-side encryption where keys stay on-premises. Platform never sees plaintext.

### 4.5 Authentication

- **SAML 2.0** SSO (SP-initiated and IdP-initiated)
- **OpenID Connect (OIDC)**
- **OAuth 2.0** (Authorization Code, Client Credentials, JWT Bearer, Refresh Token)
- **MFA** enabled by default for local logins (FIDO2, TOTP, push)
- **LDAP/Active Directory** integration for authentication and user sync

### 4.6 Application Scoping

- Each application has a unique scope/namespace (e.g., `x_mycomp_myapp`)
- Tables, scripts, and configurations are namespaced
- Cross-scope access requires explicit API declarations
- Prevents applications from interfering with each other

### 4.7 Domain Separation

- Data-level isolation within a single instance
- Multiple entities share tables but cannot see each other's data
- Hierarchical domain model (global domain at top)
- Used for managed service providers or multi-subsidiary organizations

---

## 5. User Interface Layer

### 5.1 Next Experience UI (Primary — Web Components)

**Technology**: Web Components (Custom Elements, Shadow DOM, Slots, Custom Events) with ES6+ JavaScript.

**Architecture**:

```
┌────────────────────────────────────────────────┐
│              Unified Navigation Shell            │
│  ┌──────┐ ┌────────┐ ┌───────┐ ┌────────────┐  │
│  │ Menu │ │Favorites│ │History│ │Global Search│  │
│  └──────┘ └────────┘ └───────┘ └────────────┘  │
├────────────────────────────────────────────────┤
│                   Page Content                    │
│  ┌──────────────────────────────────────────┐   │
│  │     Macroponents (composed components)    │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │ Micro  │ │ Micro  │ │ Micro  │       │   │
│  │  │ ponent │ │ ponent │ │ ponent │       │   │
│  │  └────────┘ └────────┘ └────────┘       │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │           Data Resources                  │   │
│  │  (GlideRecord queries, REST calls, etc.)  │   │
│  └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Component Model**:
- Shadow DOM for style encapsulation (CSS cannot leak in or out)
- 200+ pre-built components
- Redux-like unidirectional state management:
  - `initialState` → actions dispatched → action handlers → new state → re-render
  - Built-in actions: `COMPONENT_BOOTSTRAPPED`, `COMPONENT_PROPERTY_CHANGED`, `COMPONENT_CONNECTED`, `COMPONENT_DISCONNECTED`

**UI Builder** (Page Design Tool):
- Drag-and-drop page composition
- Macroponents (composed) and Microponents (atomic)
- Data Resources for declarative data binding
- Client State Parameters for cross-component state
- Event system: component, page, data resource, and declarative action events

**Theming**:
- CSS custom properties (variables) cascading through Shadow DOM
- Theme Builder for colors, typography, branding
- Light and dark variants

**Key Database Tables**:

| Table | Purpose |
|-------|---------|
| `sys_ux_page_registry` | Page definitions and routing |
| `sys_ux_macroponent` | Macroponent definitions (JSON component tree) |
| `sys_ux_screen_type` | Screen type definitions |
| `sys_ux_app_config` | Application shell configurations |
| `sys_ux_data_broker` | Data resource definitions |
| `sys_ux_theme` | Theme records |

### 5.2 Service Portal (Secondary — AngularJS)

**Technology**: AngularJS 1.x with widget-based architecture.

**Widget Architecture** (each widget is an isolated directive):

| Part | Purpose |
|------|---------|
| **HTML Template** | AngularJS template with directives |
| **Client Script** | AngularJS controller (`c.data`, `c.server`) |
| **Server Script** | Server-side JS populating `data` object |
| **CSS/SCSS** | Scoped styles |
| **Link Function** | Optional DOM manipulation |
| **Option Schema** | Configurable widget parameters |

**Data Binding Pattern**:
- Server → Client: Server script populates `data` object, client accesses via `c.data`
- Client → Server: Client sets values on `c.data`, calls `c.server.update()`, server re-processes
- `input` object available on `c.server.update()` calls (not initial load)

**Page Layout**: Portal → Page → Container → Row → Column → Widget

### 5.3 Agent Workspace (Configurable)

- Multi-pane layout: list view, record form, related records, activity stream, AI recommendations
- Tabbed interface for working multiple records simultaneously
- Built with UI Builder using reusable components
- Role-based workspace variants (ITSM, CSM, HRSD, SecOps)
- Agent Assist: AI-powered recommendations
- Playbook Experience: guided step-by-step resolution

### 5.4 Form Rendering

Forms are dynamically generated from metadata:

1. Read `sys_ui_form` for layout (sections, field arrangement)
2. Read `sys_dictionary` for field definitions (type, mandatory, read-only, default)
3. Read `sys_ui_policy` for dynamic behavior rules
4. Read `sys_ui_action` for buttons, links, context menus
5. Execute Display Business Rules for `g_scratchpad` data
6. Apply ACLs to determine field visibility/editability
7. Render form with all constraints applied

### 5.5 List Rendering

Lists are dynamically generated:

1. Read `sys_ui_list` for column definitions
2. Apply ACLs to filter visible records and fields
3. Support encoded query filtering: `active=true^priority<=2^ORDERBYDESCsys_created_on`
4. Pagination with configurable page size
5. Inline editing, grouping, exporting

---

## 6. Workflow & Automation Engine

### 6.1 Flow Designer (Primary — No-Code)

**Architecture**: Visual drag-and-drop workflow builder.

**Triggers** (when a flow starts):

| Trigger Type | Description |
|-------------|-------------|
| Record-based | Created, Updated, Deleted (with field conditions) |
| Schedule-based | Daily, Weekly, Monthly, Repeat intervals |
| Application-based | Service Catalog request, Inbound email |
| SLA-based | SLA percentage breached |
| REST/API | Inbound API invocation |
| Manual | User-triggered |

**Actions** (what a flow does):
- Core: Create/Update/Delete Record, Send Notification, Request Approval, Log, Set Field Values, Wait
- Integration: REST, SOAP, PowerShell, SSH, JDBC steps
- Custom: Script steps, custom spoke actions

**Logic Elements**:

| Element | Purpose |
|---------|---------|
| If / Else If / Else | Conditional branching |
| Decision Table | Multi-condition routing |
| Do Until | Loop until condition met |
| For Each | Iterate over list/array |
| Parallel | Execute branches simultaneously |
| Wait For | Pause until condition/event |
| Try / Catch | Error handling |

**Data Pills**: Visual tokens representing data flowing through steps. Each action's outputs become data pills for subsequent steps. Transform functions for string ops, date math, type conversions.

**Subflows**: Reusable sub-processes with defined inputs and outputs. Callable from flows, other subflows, or via script API.

**Execution**: Async by default. States: Draft, Published, Active, Inactive.

### 6.2 Business Rules

Server-side scripts executing on record CRUD operations.

**Timing Types**:

| Type | When | Use Case |
|------|------|----------|
| Before | Before DB operation | Modify field values before save. Do NOT call `current.update()`. |
| After | After DB operation | Side effects (create related records, notifications). May call `current.update()`. |
| Async | After, in separate job | Heavy processing without blocking user. |
| Display | On record load | Set `g_scratchpad` values for client scripts. |

**Key Objects**:
- `current` — The record being operated on
- `previous` — Record values BEFORE the change (update only)
- `g_scratchpad` — Pass data from display rules to client scripts

**Execution Order**: By `Order` field (lower = first, default 100).

### 6.3 Script Includes

Reusable server-side JavaScript classes stored in `sys_script_include`:

- **On-Demand**: Loaded when explicitly called
- **Client Callable**: Invoked from client via GlideAjax (must extend `AbstractAjaxProcessor`)
- Scoped to application namespace

### 6.4 UI Policies (No-Code Form Rules)

Declarative rules that dynamically change form field behavior:
- Set fields Visible/Hidden
- Set fields Mandatory/Not Mandatory
- Set fields Read-Only/Editable
- Optional onLoad and onChange script blocks
- **Reverse if False**: Auto-revert when condition becomes false

### 6.5 UI Actions

Buttons, links, and context menu items on forms and lists:
- Can run client-side, server-side, or both
- Placement: form buttons, form context menu, list buttons, list context menu
- Conditions control visibility

### 6.6 Scheduled Jobs

Automated scripts on a schedule:
- **Run Once**: Execute at specific date/time
- **Repeat**: Daily, weekly, monthly, custom interval
- **On Demand**: Manually triggered
- Full server-side API access

### 6.7 Approval Engine

- Approval records in `sysapproval_approver` table
- Patterns: "Anyone approves", "Everyone must approve", "First to approve/reject wins"
- Auto-generate approval records via rules and conditions
- Multi-level approval chains
- Delegation support

---

## 7. Server-Side Scripting Engine

### 7.1 GlideRecord (Database Access)

The primary API for all CRUD operations. Developers never write SQL.

**Core Operations**:
```
// Query
gr = new GlideRecord('incident')
gr.addQuery('priority', 1)
gr.addEncodedQuery('active=true^category=network')
gr.orderBy('sys_created_on')
gr.setLimit(100)
gr.query()
while (gr.next()) {
    id = gr.getUniqueValue()              // sys_id
    desc = gr.getValue('short_description')
    display = gr.getDisplayValue('assigned_to')
}

// Insert
gr.initialize()
gr.setValue('short_description', 'New incident')
gr.insert()

// Update
gr.setValue('state', 2)
gr.update()

// Delete
gr.deleteRecord()
gr.deleteMultiple()  // bulk delete
```

**Encoded Query Format**: `field=value^ORfield2=value2^NQfield3=value3`

**Operators**: `=`, `!=`, `>`, `<`, `>=`, `<=`, `STARTSWITH`, `ENDSWITH`, `CONTAINS`, `DOES NOT CONTAIN`, `IN`, `NOT IN`, `INSTANCEOF`, `ISEMPTY`, `ISNOTEMPTY`, `BETWEEN`

### 7.2 GlideSystem (gs) — System Utilities

- `gs.getUser()`, `gs.getUserID()`, `gs.getUserName()`
- `gs.now()`, `gs.nowDateTime()`, `gs.daysAgo(n)`
- `gs.info()`, `gs.warn()`, `gs.error()`, `gs.debug()` — logging
- `gs.addInfoMessage()`, `gs.addErrorMessage()` — UI messages
- `gs.eventQueue(name, record, parm1, parm2)` — fire events
- `gs.getProperty('property.name')` — system properties
- `gs.hasRole('role_name')` — role checking
- `gs.generateGUID()` — create new sys_id

### 7.3 GlideAggregate — Aggregate Queries

COUNT, SUM, AVG, MIN, MAX with groupBy support. Same query builder as GlideRecord but returns aggregate results.

### 7.4 GlideRecordSecure

Variant of GlideRecord that enforces ACLs during programmatic access. Standard GlideRecord bypasses ACLs in server-side scripts.

---

## 8. Client-Side Scripting

### 8.1 GlideForm (g_form) — Form Manipulation

- `g_form.getValue(field)` / `g_form.setValue(field, value)`
- `g_form.getDisplayValue(field)` / `g_form.getReference(field, callback)`
- `g_form.setVisible(field, bool)` / `g_form.setDisplay(field, bool)`
- `g_form.setMandatory(field, bool)` / `g_form.setReadOnly(field, bool)`
- `g_form.addOption(field, value, label)` / `g_form.removeOption(field, value)`
- `g_form.addInfoMessage(msg)` / `g_form.addErrorMessage(msg)`
- `g_form.showFieldMsg(field, msg, type)` / `g_form.hideFieldMsg(field)`
- `g_form.save()` / `g_form.submit()`
- `g_form.isNewRecord()` / `g_form.isDirty()`

### 8.2 Client Script Types

| Type | Trigger | Use Case |
|------|---------|----------|
| onLoad | Form loads | Initial setup, hide fields, set defaults |
| onChange | Field value changes | Dynamic form behavior |
| onSubmit | Form submitted | Validation, can cancel with `return false` |
| onCellEdit | List cell edited | Inline edit validation |

### 8.3 GlideAjax — Client-to-Server Calls

Async calls from browser to server-side Script Includes:
```
var ga = new GlideAjax('MyScriptInclude');
ga.addParam('sysparm_name', 'myMethod');
ga.addParam('sysparm_my_param', 'value');
ga.getXMLAnswer(function(response) { /* handle */ });
```

---

## 9. REST API & Integration Layer

### 9.1 Table API

**Base**: `/api/now/table/{table_name}`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/{table}` | Query records with filters |
| GET | `/{table}/{sys_id}` | Get single record |
| POST | `/{table}` | Create record |
| PUT | `/{table}/{sys_id}` | Full update |
| PATCH | `/{table}/{sys_id}` | Partial update |
| DELETE | `/{table}/{sys_id}` | Delete record |

**Query Parameters**: `sysparm_query`, `sysparm_fields`, `sysparm_limit`, `sysparm_offset`, `sysparm_display_value`, `sysparm_exclude_reference_link`

**Rate Limiting**: 1,000 requests/hour/user (configurable)

### 9.2 Other APIs

| API | Path | Purpose |
|-----|------|---------|
| Aggregate | `/api/now/stats/{table}` | COUNT, AVG, SUM, MIN, MAX with grouping |
| Attachment | `/api/now/attachment` | File upload/download |
| Import Set | `/api/now/import/{staging_table}` | Bulk data import |
| CMDB | `/api/now/cmdb/instance/{class}` | CMDB-specific operations |

### 9.3 Scripted REST API

Custom endpoints with full script control:

| Component | Table | Purpose |
|-----------|-------|---------|
| API Definition | `sys_ws_definition` | Namespace, version, base path |
| Resource | `sys_ws_operation` | Individual endpoint with HTTP method, path, script |

**Request Object**: `request.body`, `request.headers`, `request.queryParams`, `request.pathParams`
**Response Object**: `response.setBody()`, `response.setStatus()`, `response.setHeader()`

**Authentication**: Basic Auth, OAuth 2.0 Bearer Token, mutual TLS. Configurable per resource.

### 9.4 Integration Hub / Spokes

- Low-code integration engine within Flow Designer
- Pre-built spokes for common systems (Salesforce, Jira, AWS, Azure, Slack, Teams, SAP, Workday)
- Custom spoke development from OpenAPI specs
- Connection & Credential Aliases for environment portability
- REST, SOAP, JDBC, PowerShell, SSH step types

### 9.5 MID Server (Network Bridge)

Java application bridging cloud instance and on-premise systems:

- Installed on-premises within customer network
- **Outbound-only HTTPS** — cloud never initiates connections to MID Server
- Polls `ecc_queue` (External Communication Channel) table for tasks
- Results written back to `ecc_queue`
- Capabilities: Discovery, Orchestration, LDAP, JDBC, REST/SOAP proxy
- Clustering for load balancing and HA

### 9.6 Import Sets / Transform Maps

**Data Flow**: Data Source → Import Set (Staging Table) → Transform Map → Target Table

**Data Sources**: File (CSV/Excel/XML/JSON), JDBC, LDAP, REST, Custom script

**Transform Map Components**:
- Field Mapping (source → target)
- Coalesce fields (determine insert vs. update)
- Transform Scripts: `onBefore`, `onAfter`, `onStart`, `onComplete`, `onForeignInsert`
- Robust mode: each row processed independently (one failure doesn't stop import)

---

## 10. ITSM Modules

### 10.1 Incident Management

**Table**: `incident` (extends `task`)

**Key Fields**: `number`, `caller_id`, `category`, `subcategory`, `short_description`, `description`, `impact` (1-3), `urgency` (1-3), `priority` (calculated), `state`, `assignment_group`, `assigned_to`, `configuration_item`, `business_service`, `resolution_code`, `resolution_notes`, `close_code`, `close_notes`, `reopened_by`, `reopened_time`, `caused_by`, `problem_id`

**Priority Calculation**: Auto-calculated from Impact × Urgency via configurable lookup matrix.

| | Urgency 1 (High) | Urgency 2 (Medium) | Urgency 3 (Low) |
|---|---|---|---|
| **Impact 1 (High)** | P1 - Critical | P2 - High | P3 - Moderate |
| **Impact 2 (Medium)** | P2 - High | P3 - Moderate | P4 - Low |
| **Impact 3 (Low)** | P3 - Moderate | P4 - Low | P5 - Planning |

**State Lifecycle**: New → In Progress → On Hold → Resolved → Closed

**Features**:
- Multi-channel creation (email, portal, phone, chat, Virtual Agent, API)
- Automated assignment (rules, skills-based routing, AI)
- Major Incident Management (war room, communication plans)
- Parent-child incident linking
- SLA tracking per incident
- Activity stream (work notes internal, comments customer-visible)
- Inactivity monitors and escalation rules
- Predictive Intelligence: auto-categorization, auto-assignment, similar incident recommendation

### 10.2 Problem Management

**Table**: `problem` (extends `task`)

**Key Fields**: `number`, `short_description`, `category`, `impact`, `urgency`, `priority`, `state`, `assignment_group`, `assigned_to`, `configuration_item`, `cause_notes`, `fix_notes`, `workaround`, `known_error`, `related_incidents`

**State Lifecycle**: New → Assess → Root Cause Analysis → Fix in Progress → Resolved → Closed

**Features**:
- Root Cause Analysis with structured documentation
- Workaround Management with "Communicate Workaround" to related incidents
- Known Error Database (KEDB) — problems flagged as Known Error auto-generate KB articles
- Problem-Incident linking (M:M)
- Problem Tasks for multi-team investigation

### 10.3 Change Management

**Table**: `change_request` (extends `task`)

**Key Fields**: `number`, `type` (Normal/Standard/Emergency), `short_description`, `category`, `priority`, `risk`, `impact`, `state`, `requested_by`, `start_date`, `end_date`, `implementation_plan`, `backout_plan`, `test_plan`, `cab_required`, `conflict_status`

**Change Types**:

| Type | Risk | Approval | Process |
|------|------|----------|---------|
| Standard | Low | Pre-approved | Follows documented procedure |
| Normal | Medium | CAB required | Full assessment and multi-level approval |
| Emergency | High | Expedited CAB | Bypasses peer review, direct to authorization |

**State Lifecycle**: Draft → Assess → Authorize → Scheduled → Implement → Review → Closed

**Features**:
- Change Advisory Board (CAB) management
- Conflict detection (blackouts, maintenance windows, other changes)
- Risk assessment with configurable scoring
- Change models/templates
- Change schedule/calendar view
- Post-Implementation Review (PIR)

### 10.4 Service Catalog & Request Management

**Tables**:

| Table | Purpose |
|-------|---------|
| `sc_catalog` | Catalog definition |
| `sc_category` | Category hierarchy |
| `sc_cat_item` | Catalog item definition |
| `sc_request` | Request (extends `task`) |
| `sc_req_item` | Requested item (extends `task`) |
| `sc_task` | Catalog fulfillment task (extends `task`) |

**Catalog Item Components**:
- Variables (form fields: text, select, reference, checkbox, date, etc.)
- Variable Sets (reusable groups of variables)
- Catalog Client Scripts (onChange, onLoad, onSubmit)
- Catalog UI Policies
- Pricing (recurring and one-time)
- Approval rules
- Fulfillment flow

**Order Hierarchy**: Catalog → Category → Item. On order: Request → Requested Item(s) → Catalog Task(s)

**Features**:
- Portal-based shopping experience with search
- Record Producers (catalog items that create records on other tables)
- Order Guides (bundle multiple items into guided ordering)
- Multi-step approval chains
- Fulfillment via Flow Designer

### 10.5 Knowledge Management

**Tables**: `kb_knowledge_base`, `kb_knowledge` (article), `kb_category`, `kb_feedback`

**Key Fields on Article**: `number`, `short_description`, `text` (rich text body), `article_type`, `workflow_state`, `published`, `valid_to`, `kb_knowledge_base`, `kb_category`, `author`, `rating`, `view_count`

**Article Lifecycle**: Draft → Review → Published → Retired/Archived

**Features**:
- Multiple knowledge bases (IT, HR, Customer-facing)
- Rich text editor with images, attachments, video
- Article templates and versioning
- Knowledge-Centered Service (KCS) support
- Search integration (incident creation, portal, Virtual Agent)
- Feedback loop (rating, flagging, comments)
- Multi-language support
- Analytics (view counts, helpfulness, search terms, article gaps)

### 10.6 SLA Management

**Tables**: `contract_sla` (SLA Definition), `task_sla` (SLA instance on a task)

**Four Core Conditions**:

| Condition | Description | Example |
|-----------|-------------|---------|
| Start | When timer begins | Incident assigned |
| Pause | When timer pauses | Awaiting customer input |
| Stop | When timer stops | Incident resolved |
| Reset | When timer resets | Incident reassigned |

**Escalation**: Flow Designer flow with percentage-based triggers (50%, 75%, 100% breach).

**Features**:
- Schedule-aware (business hours, holidays, time zones)
- Retroactive SLA capability
- Multiple SLAs per task (Response + Resolution)
- Breach tracking and compliance dashboards

### 10.7 Asset Management (ITAM)

**Tables**: `alm_asset`, `alm_hardware`, `alm_consumable`, `alm_license`, `ast_contract`

**Lifecycle**: Planning → Procurement → Receiving → In Stock → In Use → In Maintenance → Retired/Disposed

**Sub-Modules**:
- **Hardware Asset Management (HAM)**: Physical tracking, stockrooms, RMA, depreciation
- **Software Asset Management (SAM)**: License tracking, compliance, reclamation
- **Cloud Asset Management**: Cloud resource cost tracking and optimization

---

## 11. ITOM Modules

### 11.1 Discovery

Automatically scan networks and populate/update the CMDB:
- Network scanning using probes, sensors, and patterns
- Discovers: servers, network devices, storage, applications, databases, VMs, cloud resources, containers
- Agentless (WMI, SSH, SNMP) and agent-based (MID Server)
- Horizontal discovery (network scan) and pattern-based (application mapping)
- Scheduling and credential management

### 11.2 Service Mapping

Automatically build dynamic maps of business services and underlying infrastructure:
- Top-down mapping from business service to infrastructure CIs
- Dynamic maps that auto-update as infrastructure changes
- Impact analysis with upstream/downstream dependencies
- Root cause identification
- Integration with Event Management for real-time health overlay

### 11.3 Event Management

Aggregate, correlate, and prioritize events from monitoring tools:
- Integration with 100+ monitoring tools
- Event ingestion via REST API, email, SNMP traps, MID Server
- AI/ML-based event correlation (group related events into alerts)
- Duplicate suppression and noise reduction
- Event → Alert → Incident automation
- Root cause indicators on service maps

### 11.4 Health Log Analytics

- Unsupervised ML on log data for anomaly detection
- Predictive capabilities for service issues
- Cross-domain correlation with metrics and events

### 11.5 Cloud Management

- Self-service cloud provisioning via Service Catalog (AWS, Azure, GCP)
- CloudFormation and Terraform template support
- Cloud governance with compliance checks
- Cost management and rightsizing recommendations
- Multi-cloud resource visibility in CMDB

---

## 12. ITBM / Strategic Portfolio Management

### 12.1 Project Portfolio Management

- Project creation with milestones, tasks, dependencies
- Gantt charts and timeline views
- Resource allocation and capacity planning
- Budget tracking and financial management
- Risk and issue tracking per project
- Waterfall and hybrid methodology support

### 12.2 Demand Management

- Demand intake via forms/portal
- Assessment, scoring, and prioritization frameworks
- Demand-to-project conversion pipeline
- Business case management
- Approval workflows

### 12.3 Resource Management

- Resource availability and capacity views
- Skills-based resource matching
- Allocation management (planned vs. actual)
- Utilization tracking and conflict detection

### 12.4 Agile Development

- Scrum Board: visual Kanban with drag-and-drop
- Work item hierarchy: Epics → Features → User Stories → Tasks
- Sprint management with configurable duration
- Backlog management and grooming
- Team velocity and burndown/burnup charts
- SAFe support (Agile Release Trains, Program Increments)

### 12.5 Application Portfolio Management

- Application inventory and lifecycle tracking
- Business criticality assessment
- TIME model rationalization (Tolerate, Invest, Migrate, Eliminate)
- Technology obsolescence tracking

---

## 13. Customer Service Management

### 13.1 Case Management

**Table**: `sn_customerservice_case` (extends `task`)

**Key Fields**: `number`, `account`, `contact`, `product`, `asset`, `entitlement`, `priority`, `state`, `category`, `assignment_group`, `assigned_to`, `resolution_code`

**Related Tables**: `customer_account`, `customer_contact`, `sn_customerservice_product`, `sn_entitlement`

**Features**:
- Multi-channel case creation (portal, email, phone, chat, social, API)
- AI-driven categorization and prioritization
- Skills-based routing
- Parent-child case hierarchy with parallel task assignment
- Entitlement management (service level per customer)
- 360-degree customer view (account, contacts, cases, products, assets)

### 13.2 Customer Portal

- B2B self-service for case management, knowledge, entitlements
- Branded/customizable portal
- Role-based access (admin contacts see all company cases)

### 13.3 Field Service Management

**Tables**: `wm_order` (work order), `wm_task` (work order task), `sn_agent` (field agent)

**Features**:
- Intelligent scheduling engine (skills, availability, proximity, equipment)
- Dispatcher workspace with map-based view
- Task bundling and multi-day scheduling
- Mobile app with offline-first, GPS geofencing, barcode scanning
- Parts/inventory management
- SLA tracking for field work

### 13.4 Omni-Channel Support

- Phone (CTI), email, chat, portal, social media, messaging (SMS/WhatsApp), walk-up
- Interaction records with channel-to-case routing
- Context preservation across channel transfers
- Agent presence management

---

## 14. HR Service Delivery

### 14.1 Employee Service Center

- Unified portal for all employee self-service (HR, IT, Facilities, Payroll, Legal)
- AI-powered search and Virtual Agent
- Personalization based on role, department, location
- Task management ("My Tasks", "My Requests")

### 14.2 HR Case Management

**Table**: `hr_case` (extends `task`)

- Category-based routing (benefits, payroll, employee relations)
- Skills-based assignment
- Sensitive case handling with restricted visibility
- SLA tracking for HR response and resolution

### 14.3 Lifecycle Events

Automate multi-department processes for employee life changes:

| Event | Activities |
|-------|-----------|
| Onboarding | Account provisioning, equipment request, orientation, benefits enrollment |
| Offboarding | Access revocation, equipment return, exit interview, knowledge transfer |
| Job Change | Role update, access modification, workspace change |
| Leave of Absence | Workflow triggers, status updates, return planning |

**Architecture**: Lifecycle Event → Case → Milestones → Activities (tasks, notifications, approvals spanning HR, IT, Facilities, Security, Payroll)

### 14.4 Employee Document Management

- Centralized document storage per employee
- Document templates and digital signatures
- Retention policies and auto-archival
- Role-based access control

---

## 15. Security Operations

### 15.1 Security Incident Response (SIR)

**Table**: `sn_si_incident` (extends `task`)

**Features**:
- SIEM integration (Splunk, QRadar, Sentinel)
- Alert ingestion via REST API, email, direct integration
- Incident enrichment with user identity, CMDB data, threat intelligence, IOC matches
- Automated playbooks: malware, phishing, brute-force, data breach, DoS, insider threat
- Orchestration: firewall block, endpoint isolation, account disable via Integration Hub
- MTTD and MTTR metrics

### 15.2 Vulnerability Response

**Table**: `sn_vul_vulnerable_item` (vulnerability linked to CI)

**Features**:
- Scanner integration (Qualys, Tenable, Rapid7)
- Risk-based prioritization: CVSS + asset criticality + exploit availability + threat intel
- Automated remediation task creation
- Exception management with approval workflows
- Vulnerability aging and SLA compliance

### 15.3 Threat Intelligence

- Threat feed integration (STIX/TAXII, CSV, API)
- IOC matching against CMDB and security incidents
- Sighting tracking and intelligence sharing

---

## 16. Governance, Risk & Compliance

### 16.1 Policy & Compliance Management

- Policy lifecycle: create, review, approve, publish, attest, retire
- Authority documents (SOX, GDPR, HIPAA, ISO 27001)
- Control objectives mapped to policies
- Control testing with evidence collection
- Compliance scoring dashboards
- Policy attestation with tracking
- Continuous monitoring via IT system integration

### 16.2 Risk Management

- Risk register with assessment methodology
- Qualitative (Likelihood × Impact) and Quantitative (ALE) assessment
- Risk heat maps with color-coded levels
- Risk appetite/tolerance thresholds
- Key Risk Indicators (KRIs) with automated monitoring
- Risk response: Accept, Mitigate, Transfer, Avoid
- Risk-to-Control mapping

### 16.3 Audit Management

- Audit planning with scope, objectives, budgets
- Evidence collection workflows
- Finding management with severity and remediation tracking
- Workpapers and structured documentation
- Follow-up tracking to closure

---

## 17. App Engine & Low-Code Platform

### 17.1 App Engine Studio

- Drag-and-drop application builder
- Table designer (fields, relationships, inheritance)
- Form designer (layout, sections, formatters)
- Pre-built templates for common patterns
- Application scoping for isolation
- Delegated development for citizen developers
- Governance via App Engine Management Center

### 17.2 Flow Designer

(See Section 6.1 for full specification)

### 17.3 UI Builder

(See Section 5.1 for full specification)

### 17.4 Integration Hub

(See Section 9.4 for full specification)

### 17.5 Automation Engine

- **RPA Hub**: Record/playback UI automation, attended/unattended bots, legacy system integration
- **Document Intelligence**: OCR, AI-powered data extraction from documents, template and ML-based extraction models

---

## 18. AI & Virtual Agent

### 18.1 Virtual Agent (Chatbot)

- Visual conversation designer (no-code topic flows)
- Pre-built topics for ITSM, CSM, HRSD
- NLU engine with intent recognition and entity extraction
- Multi-channel: web portal, mobile, Slack, Teams, SMS
- Live agent handoff with full conversation context
- Rich responses: cards, carousels, images, links
- Contextual actions: create incidents, look up KB, check status, reset passwords
- Analytics: deflection rates, containment rates, handoff rates

### 18.2 Generative AI (Now Assist)

- AI Search: semantic/conversational search across knowledge, catalog, community
- Summarization: auto-summaries for incidents, cases, chats, changes
- Content Generation: draft emails, chat replies, KB articles, work notes
- Code Generation: scripts, business rules, flows from natural language
- Recommended actions based on context

### 18.3 Predictive Intelligence (Classic ML)

- Classification: auto-categorize, auto-prioritize, auto-assign using supervised ML
- Similarity: find similar records via clustering
- Regression: predict numeric values (e.g., resolution time)
- No-code model builder with confidence scores and explanations
- Models trained on historical platform data, retrained on schedule

---

## 19. Reporting & Analytics

### 19.1 Core Reporting

**Report Types**: Bar, Line, Pie, Donut, Area, Column, Histogram, Scatter, Pivot Table, List, Calendar, Map, Trend, Gauge, Speedometer, Dial, Single Score

**Features**:
- Drag-and-drop report builder
- Data source: any table with field-level filtering
- Scheduled generation and email distribution
- Drill-down from chart to underlying records
- Export: PDF, Excel, CSV
- Role-based access control

### 19.2 Dashboards

- Drag-and-drop layout with configurable widgets
- Widget types: PA widgets, charts, reports, metrics, lists, HTML, custom
- Role-based dashboards
- Real-time auto-refresh
- Interactive global filters
- Responsive layout

### 19.3 Performance Analytics

- KPI/Indicator definitions with collection frequency, breakdowns, targets
- Scorecards with weighted scoring
- Time series analysis with forecasting
- Breakdowns by dimensions (group, category, priority, location)
- Anomaly detection with automatic alerts
- Data collection jobs for historical snapshots
- Executive dashboards with drill-down

---

## 20. Notification System

### 20.1 Outbound Email

- SMTP-based with configurable templates
- Triggered by events (registered in `sysevent_register`)
- Dynamic content via template engine
- Recipient rules (users, groups, roles, scripted)
- Watermark system for reply tracking (unique ID in headers/body)

### 20.2 Inbound Email

- POP3/IMAP polling
- Inbound email actions: condition-based rules for processing
- Watermark extraction to match replies to existing records
- Create new records or update existing based on rules

### 20.3 Other Channels

- Push notifications (mobile app)
- SMS (via gateway integration)
- In-platform notification panel
- Slack/Teams integration via spokes

### 20.4 Event Queue

Central async processing via `sysevent` table:
- Events fired via `gs.eventQueue(name, record, parm1, parm2)`
- Event processing engine triggers associated notifications and script actions

---

## 21. Import & Data Integration

### 21.1 Import Sets

**Flow**: Data Source → Staging Table → Transform Map → Target Table

**Data Sources**: CSV, Excel, XML, JSON, JDBC (via MID Server), LDAP, REST

**Transform Features**:
- Auto-map matching fields
- Coalesce fields for insert-vs-update logic
- Transform scripts (onBefore, onAfter, onStart, onComplete)
- Choice action handling (create, reject, ignore)
- Robust mode (row-independent processing)

### 21.2 LDAP / Active Directory

- Connection via MID Server (on-premise) or direct (cloud LDAP)
- User and group import with scheduled sync
- Coalesce on `samaccountname` or `objectguid`
- LDAP authentication support

### 21.3 Remote Tables

Query external data as if it were a platform table (virtual tables backed by external APIs).

---

## 22. Instance Management & Deployment

### 22.1 Update Sets

- Capture configuration changes as XML records in `sys_update_xml`
- Transport mechanism: Dev → Test → Prod
- Tracked tables defined in `sys_update_set_source` (configuration tables only, not data)
- Lifecycle: Create → Make Changes → Complete → Export → Import → Preview → Commit
- Conflict detection and resolution during preview
- Batch update sets for multi-developer scenarios

### 22.2 Scoped Application Deployment

- Publish/Install via Application Repository (preferred)
- Versioned packages with dependency management
- Source control integration (Git: GitHub, GitLab, Bitbucket)
- Marketplace distribution

### 22.3 Automated Test Framework (ATF)

- Server-side steps: Create/Update/Delete Record, Run Script, Assert Values
- Client-side steps: Open Form, Set Field, Click UI Action, Validate, Submit
- Test Suites for hierarchical grouping
- Parameterized tests for data-driven testing
- CI/CD pipeline integration

### 22.4 CI/CD Pipeline

- Source control → Build → Test (ATF) → Quality Gates → Promote
- Integration with Jenkins, Azure DevOps, GitHub Actions
- ServiceNow CI/CD Spokes in Integration Hub

---

## 23. Mobile Platform

### 23.1 Now Mobile (Employee App)

- Native iOS/Android
- OAuth 2.0 authentication (leverages SSO/SAML)
- Self-service: requests, approvals, tasks, knowledge
- Push notifications
- Camera, GPS, barcode scanning, biometric auth

### 23.2 Mobile Agent (Fulfiller App)

- Agent-focused workflows (ITSM, CSM, field service)
- Offline-first with delta sync
- GPS geofencing for arrival confirmation
- Parts/inventory management

### 23.3 Mobile App Builder

- No-code tool for mobile experience configuration
- Pre-configured layout templates and design elements
- 25+ mobile workflow plugins

---

## 24. Recommended Technology Stack

### 24.1 Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | TypeScript / Node.js | Server-side JS matching ServiceNow's scripting model |
| Framework | NestJS | Modular, enterprise-grade, dependency injection |
| Database | PostgreSQL | Matches RaptorDB (PostgreSQL fork), HTAP capable |
| ORM | Custom metadata-driven | Mirror ServiceNow's GlideRecord abstraction |
| Cache | Redis | Session, metadata, query caching |
| Search | Elasticsearch / OpenSearch | Full-text search, knowledge articles, CMDB |
| Queue | Bull (Redis) or RabbitMQ | Event queue, async business rules, scheduled jobs |
| File Storage | S3-compatible (MinIO) | Attachments, exports |

### 24.2 Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | React + Web Components | React for productivity, Web Components for portal extensibility |
| State | Redux Toolkit / Zustand | Matches ServiceNow's unidirectional state model |
| UI Library | Custom design system | Build equivalent of Now Design System |
| Form Engine | Dynamic JSON-schema forms | Metadata-driven form rendering from sys_dictionary |
| Portal Widgets | Web Components | Shadow DOM encapsulation like Next Experience |
| Drag-and-Drop | react-dnd or dnd-kit | Flow Designer, UI Builder, Form Designer |

### 24.3 Infrastructure

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Container | Docker | Instance isolation |
| Orchestration | Kubernetes | Multi-instance management, scaling |
| API Gateway | Kong or Nginx | Rate limiting, auth, routing |
| CI/CD | GitHub Actions | Pipeline automation |
| Monitoring | Prometheus + Grafana | Platform health |
| Logging | ELK Stack | Centralized logging |

### 24.4 AI/ML

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| NLU | Rasa or custom LLM | Virtual Agent intent recognition |
| Generative AI | Claude API | Now Assist equivalent (summarization, code gen) |
| ML Pipeline | scikit-learn / custom | Predictive Intelligence (classification, similarity) |
| Vector DB | pgvector (PostgreSQL) | Semantic search for knowledge articles |

---

## Appendix A: Key Database Tables Reference

### System Tables
| Table | Purpose |
|-------|---------|
| `sys_db_object` | Table definitions |
| `sys_dictionary` | Field definitions |
| `sys_choice` | Choice list values |
| `sys_properties` | System properties |
| `sys_ui_form` | Form layouts |
| `sys_ui_list` | List view columns |
| `sys_ui_action` | Buttons/links/menus |
| `sys_ui_policy` | Declarative form rules |
| `sys_script` | Business rules |
| `sys_script_include` | Reusable server scripts |
| `sys_script_client` | Client scripts |
| `sys_security_acl` | ACL rules |
| `sys_update_set` | Update sets |
| `sys_update_xml` | Update set payloads |
| `sys_metadata` | Base metadata table |
| `sys_scope` / `sys_app` | Application scopes |
| `sys_trigger` | Scheduled jobs |
| `sys_journal_field` | Journal/activity entries |
| `sys_audit` | Audit trail |
| `sys_attachment` | File attachments |
| `sys_user` | Users |
| `sys_user_group` | Groups |
| `sys_user_role` | Roles |
| `sys_user_has_role` | User-role assignments |
| `sys_user_grmember` | Group membership |
| `sys_group_has_role` | Group-role assignments |
| `sys_user_role_contains` | Role inheritance |
| `sysevent` | Event queue |
| `sysevent_register` | Event registration |
| `sysevent_email_action` | Notification rules |
| `sysapproval_approver` | Approval records |

### ITSM Tables
| Table | Extends | Purpose |
|-------|---------|---------|
| `task` | — | Base task table |
| `incident` | `task` | Incidents |
| `problem` | `task` | Problems |
| `change_request` | `task` | Changes |
| `sc_request` | `task` | Requests |
| `sc_req_item` | `task` | Requested items |
| `sc_task` | `task` | Catalog tasks |
| `sc_catalog` | — | Service catalogs |
| `sc_category` | — | Catalog categories |
| `sc_cat_item` | — | Catalog items |
| `kb_knowledge_base` | — | Knowledge bases |
| `kb_knowledge` | — | Knowledge articles |
| `contract_sla` | — | SLA definitions |
| `task_sla` | — | SLA instances |
| `alm_asset` | — | Assets |
| `alm_hardware` | `alm_asset` | Hardware assets |
| `alm_license` | `alm_asset` | Software licenses |

### CMDB Tables
| Table | Extends | Purpose |
|-------|---------|---------|
| `cmdb` | — | Root CMDB |
| `cmdb_ci` | `cmdb` | Base CI |
| `cmdb_ci_server` | `cmdb_ci_computer` | Servers |
| `cmdb_ci_appl` | `cmdb_ci` | Applications |
| `cmdb_ci_service` | `cmdb_ci` | Services |
| `cmdb_ci_business_service` | `cmdb_ci_service` | Business services |
| `cmdb_rel_ci` | — | CI relationships |
| `cmdb_rel_type` | — | Relationship types |

### CSM Tables
| Table | Extends | Purpose |
|-------|---------|---------|
| `sn_customerservice_case` | `task` | Customer cases |
| `customer_account` | — | Customer accounts |
| `customer_contact` | — | Customer contacts |
| `wm_order` | — | Work orders |
| `wm_task` | — | Work order tasks |

### HR Tables
| Table | Extends | Purpose |
|-------|---------|---------|
| `hr_case` | `task` | HR cases |
| `sn_hr_core_profile` | — | HR profiles |

### SecOps Tables
| Table | Extends | Purpose |
|-------|---------|---------|
| `sn_si_incident` | `task` | Security incidents |
| `sn_vul_vulnerable_item` | — | Vulnerable items |
| `sn_vul_vulnerability` | — | Vulnerability definitions |

---

## Appendix B: API Endpoint Summary

```
# Table API
GET    /api/now/table/{table}
GET    /api/now/table/{table}/{sys_id}
POST   /api/now/table/{table}
PUT    /api/now/table/{table}/{sys_id}
PATCH  /api/now/table/{table}/{sys_id}
DELETE /api/now/table/{table}/{sys_id}

# Aggregate API
GET    /api/now/stats/{table}

# Attachment API
GET    /api/now/attachment
GET    /api/now/attachment/{sys_id}
GET    /api/now/attachment/{sys_id}/file
POST   /api/now/attachment/file

# Import Set API
POST   /api/now/import/{staging_table}

# CMDB API
GET    /api/now/cmdb/instance/{class}
POST   /api/now/cmdb/instance/{class}

# Scripted REST API
{method} /api/{namespace}/v{version}/{resource}

# Authentication
POST   /oauth_token.do
GET    /oauth_auth.do
```

---

*End of Specification*
