# Intelligent VMS - Comprehensive System Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend - Next.js Application"
        A[Client Browser] --> B[Next.js App]
        B --> C[Apollo Client]
        C --> D[GraphQL Queries/Mutations]
        B --> E[Zustand State Management]
        B --> F[React Components]
        
        subgraph "Pages"
            F1[Login Page]
            F2[Admin Dashboard]
            F3[Visitor Dashboard]
            F4[Receptionist Dashboard]
            F5[Create Invite]
            F6[Profile Page]
            F7[Reporting]
            F8[User Analytics]
        end
        
        subgraph "Components"
            G1[VisitorCard]
            G2[QRScanner]
            G3[SignInPopUp]
            G4[SignOutPopUp]
            G5[UploadPopUp]
            G6[VisitorSuggestions]
            G7[VisitorSearchResults]
            G8[CreateUserForm]
        end
        
        F --> F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8
        F --> G1 & G2 & G3 & G4 & G5 & G6 & G7 & G8
    end
    
    subgraph "Backend - NestJS Application"
        H[GraphQL API] --> I[App Module]
        I --> J[Authentication Module]
        I --> K[User Module]
        I --> L[Visitor-Invite Module]
        I --> M[Parking Module]
        I --> N[Restrictions Module]
        I --> O[Rewards Module]
        I --> P[Receptionist Module]
        I --> Q[Resident Module]
        I --> R[Mail Module]
        I --> S[Database Module]
        I --> T[Throttler Module]
        
        subgraph "Services & Resolvers"
            U[User Service/Resolver]
            V[Visitor-Invite Service/Resolver]
            W[Auth Service]
            X[Parking Service]
            Y[Mail Service]
            Z[Database Service]
        end
        
        K --> U
        L --> V
        J --> W
        M --> X
        R --> Y
        S --> Z
    end
    
    subgraph "Database Layer"
        AA[MongoDB]
        AB[User Collection]
        AC[Invite Collection]
        AD[Visitor Collection]
        AE[Parking Collection]
        AF[Restriction Collection]
        AG[Reward Collection]
        
        AA --> AB & AC & AD & AE & AF & AG
    end
    
    subgraph "External Services"
        AH[Email Service]
        AI[File Storage]
        AJ[QR Code Generator]
    end
    
    D --> H
    Z --> AA
    Y --> AH
    G2 --> AJ
    G5 --> AI
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style H fill:#e8f5e8
    style AA fill:#fff3e0
```

## 2. Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend Data Flow"
        A[User Action] --> B[React Component]
        B --> C[Apollo Client]
        C --> D[GraphQL Query/Mutation]
        D --> E[HTTP Request]
    end
    
    subgraph "Backend Data Flow"
        F[GraphQL Endpoint] --> G[Resolver]
        G --> H[Service Layer]
        H --> I[Database Operations]
        I --> J[MongoDB]
        
        subgraph "Authentication Flow"
            K[Auth Guard] --> L[JWT Validation]
            L --> M[Role Check]
            M --> N[Permission Granted]
        end
        
        subgraph "Business Logic"
            O[Invite Creation]
            P[User Management]
            Q[Parking Management]
            R[Visitor Tracking]
            S[Reporting]
        end
        
        H --> O & P & Q & R & S
    end
    
    subgraph "Response Flow"
        T[Database Response] --> U[Service Processing]
        U --> V[Resolver Response]
        V --> W[GraphQL Response]
        W --> X[HTTP Response]
    end
    
    E --> F
    G --> K
    N --> H
    J --> T
    X --> C
    
    style A fill:#ffebee
    style F fill:#e8f5e8
    style J fill:#fff3e0
    style K fill:#fce4ec
```

## 3. User Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant DB as Database
    participant G as GraphQL Resolver
    
    Note over U,G: Login Process
    U->>F: Enter credentials
    F->>A: Login mutation
    A->>DB: Validate user
    DB-->>A: User data
    A->>A: Generate JWT
    A-->>F: JWT token + user info
    F->>F: Store in Zustand
    
    Note over U,G: Protected Request
    U->>F: Access protected page
    F->>G: GraphQL request + JWT
    G->>A: Validate JWT
    A->>A: Check permissions
    A-->>G: Authorization result
    
    alt Authorized
        G->>DB: Execute query
        DB-->>G: Data
        G-->>F: Response
        F-->>U: Display content
    else Unauthorized
        G-->>F: Error response
        F-->>U: Redirect to login
    end
```

## 4. Visitor Management Workflow

```mermaid
graph TD
    A[Resident Creates Invite] --> B{Parking Required?}
    B -->|Yes| C[Check Parking Availability]
    B -->|No| D[Create Invite]
    C --> E{Parking Available?}
    E -->|Yes| F[Reserve Parking Spot]
    E -->|No| G[Notify No Parking]
    F --> D
    G --> H[Create Invite Without Parking]
    D --> I[Generate QR Code]
    H --> I
    I --> J[Send Email to Visitor]
    J --> K[Visitor Receives Invite]
    
    K --> L[Visitor Arrives]
    L --> M[Receptionist Scans QR]
    M --> N[Validate Invite]
    N --> O{Valid Invite?}
    O -->|Yes| P[Sign In Visitor]
    O -->|No| Q[Reject Entry]
    P --> R[Update Visitor Status]
    R --> S[Notify Resident]
    
    S --> T[Visitor Inside]
    T --> U[Visitor Leaves]
    U --> V[Sign Out Process]
    V --> W[Update Status]
    W --> X[Release Parking]
    X --> Y[Complete Visit]
    
    style A fill:#e3f2fd
    style P fill:#e8f5e8
    style Q fill:#ffebee
    style Y fill:#f3e5f5
```

## 5. Component Interaction Diagram

```mermaid
graph TB
    subgraph "Admin Dashboard Components"
        A1[AdminDashboard] --> A2[User Management]
        A1 --> A3[System Settings]
        A1 --> A4[Analytics Charts]
        A1 --> A5[Parking Management]
        A1 --> A6[Restrictions Management]
    end
    
    subgraph "Visitor Dashboard Components"
        B1[VisitorDashboard] --> B2[Active Invites]
        B1 --> B3[Create Invite Button]
        B1 --> B4[Visitor History]
        B1 --> B5[Profile Settings]
        B2 --> B6[VisitorCard]
        B6 --> B7[QR Code Display]
        B6 --> B8[Visitor Details]
    end
    
    subgraph "Receptionist Dashboard Components"
        C1[ReceptionistDashboard] --> C2[QR Scanner]
        C1 --> C3[Pending Invites]
        C1 --> C4[Sign In/Out Forms]
        C2 --> C5[Camera Interface]
        C3 --> C6[Invite Validation]
        C4 --> C7[Visitor Processing]
    end
    
    subgraph "Shared Components"
        D1[Layout] --> D2[Navigation]
        D1 --> D3[Header]
        D1 --> D4[Footer]
        D5[AlertProvider] --> D6[Notifications]
        D7[AuthCard] --> D8[Login Form]
        D9[CreateUserForm] --> D10[User Registration]
    end
    
    subgraph "State Management"
        E1[AuthStore] --> E2[User Session]
        E1 --> E3[Permissions]
        E1 --> E4[Navigation Links]
        E5[Apollo Cache] --> E6[GraphQL Data]
    end
    
    A1 --> D1
    B1 --> D1
    C1 --> D1
    D8 --> E1
    B3 --> F1[CreateInvite Page]
    C2 --> F2[Invite Validation]
    
    style A1 fill:#ffecb3
    style B1 fill:#c8e6c9
    style C1 fill:#f8bbd9
    style E1 fill:#e1bee7
```

## 6. Database Schema Relationships

```mermaid
erDiagram
    User {
        string _id PK
        string email UK
        string password
        string name
        string permission
        string idNumber
        string idDocType
        boolean isAuthorized
        boolean isVerified
        string verifyID
        date createdAt
        date updatedAt
    }
    
    Invite {
        string _id PK
        string inviteID UK
        string residentEmail FK
        string visitorName
        string visitorEmail
        string visitorIdNumber
        string visitorIdDocType
        boolean isParkingRequired
        string parkingSpot
        string status
        date inviteDate
        date expiryDate
        boolean isGroupInvite
        number maxVisitors
        date createdAt
        date updatedAt
    }
    
    Visitor {
        string _id PK
        string inviteID FK
        string name
        string email
        string idNumber
        string idDocType
        date signInTime
        date signOutTime
        string status
        string signedInBy
        string signedOutBy
        date createdAt
        date updatedAt
    }
    
    Parking {
        string _id PK
        string spotNumber UK
        boolean isAvailable
        string reservedFor FK
        date reservationStart
        date reservationEnd
        date createdAt
        date updatedAt
    }
    
    Restriction {
        string _id PK
        string type
        string description
        number value
        string unit
        boolean isActive
        date createdAt
        date updatedAt
    }
    
    Reward {
        string _id PK
        string userEmail FK
        string type
        string description
        number points
        date earnedDate
        boolean isRedeemed
        date redeemedDate
        date createdAt
        date updatedAt
    }
    
    User ||--o{ Invite : creates
    Invite ||--o{ Visitor : generates
    User ||--o{ Reward : earns
    Invite ||--o| Parking : reserves
    User ||--o{ Parking : "can reserve"
```

## 7. GraphQL API Structure

```mermaid
graph TB
    subgraph "GraphQL Schema"
        A[Query Type] --> B[User Queries]
        A --> C[Invite Queries]
        A --> D[Visitor Queries]
        A --> E[Parking Queries]
        A --> F[Analytics Queries]
        
        G[Mutation Type] --> H[User Mutations]
        G --> I[Invite Mutations]
        G --> J[Visitor Mutations]
        G --> K[Parking Mutations]
        G --> L[Auth Mutations]
        
        subgraph "User Operations"
            B --> B1[searchUser]
            B --> B2[getUnauthorizedUsers]
            B --> B3[helloUser]
            H --> H1[signup]
            H --> H2[verify]
            H --> H3[deleteUserAccount]
            H --> H4[authorizeUserAccount]
        end
        
        subgraph "Invite Operations"
            C --> C1[getInvites]
            C --> C2[getInvite]
            C --> C3[getVisitors]
            C --> C4[getInviteSuggestions]
            I --> I1[createInvite]
            I --> I2[updateInvite]
            I --> I3[deleteInvite]
            I --> I4[bulkSignIn]
        end
        
        subgraph "Authentication"
            L --> L1[login]
            L --> L2[logout]
            L --> L3[refreshToken]
        end
        
        subgraph "Analytics"
            F --> F1[getTotalNumberOfVisitors]
            F --> F2[getNumInvitesPerDate]
            F --> F3[getPredictedInviteData]
            F --> F4[getUsedParkingsInRange]
        end
    end
    
    subgraph "Resolvers"
        M[UserResolver] --> B & H
        N[VisitorInviteResolver] --> C & I
        O[AuthResolver] --> L
        P[ParkingResolver] --> E & K
        Q[AnalyticsResolver] --> F
    end
    
    style A fill:#e3f2fd
    style G fill:#f3e5f5
    style M fill:#e8f5e8
```

## 8. Security & Permission Model

```mermaid
graph TD
    A[User Request] --> B[JWT Token Validation]
    B --> C{Valid Token?}
    C -->|No| D[Unauthorized Response]
    C -->|Yes| E[Extract User Info]
    E --> F[Check User Permission]
    F --> G{Permission Check}
    
    G -->|Admin| H[Full Access]
    G -->|Receptionist| I[Limited Admin Access]
    G -->|Resident| J[User Level Access]
    G -->|Visitor| K[Read Only Access]
    
    H --> L[Execute Operation]
    I --> M{Operation Type}
    J --> N{Resource Owner}
    K --> O[Public Data Only]
    
    M -->|User Management| L
    M -->|System Settings| P[Restricted]
    M -->|Invite Management| L
    
    N -->|Own Resources| L
    N -->|Others Resources| P
    
    L --> Q[Success Response]
    P --> R[Forbidden Response]
    O --> S[Limited Data Response]
    
    style A fill:#e3f2fd
    style H fill:#c8e6c9
    style I fill:#fff9c4
    style J fill:#ffccbc
    style K fill:#f8bbd9
    style P fill:#ffcdd2
```

## 9. Real-time Features & WebSocket Flow

```mermaid
sequenceDiagram
    participant R as Resident
    participant F as Frontend
    participant B as Backend
    participant WS as WebSocket
    participant RC as Receptionist
    participant V as Visitor
    
    Note over R,V: Real-time Visitor Status Updates
    
    R->>F: Create invite
    F->>B: GraphQL mutation
    B->>WS: Broadcast invite created
    WS->>RC: New invite notification
    
    V->>RC: Arrives at gate
    RC->>F: Scan QR code
    F->>B: Sign in mutation
    B->>WS: Broadcast visitor signed in
    WS->>R: Visitor arrival notification
    WS->>F: Update invite status
    
    V->>RC: Ready to leave
    RC->>F: Sign out visitor
    F->>B: Sign out mutation
    B->>WS: Broadcast visitor signed out
    WS->>R: Visitor departure notification
    WS->>F: Update visitor status
```

## 10. Error Handling & Validation Flow

```mermaid
graph TD
    A[User Input] --> B[Frontend Validation]
    B --> C{Valid Input?}
    C -->|No| D[Display Error Message]
    C -->|Yes| E[Send to Backend]
    
    E --> F[GraphQL Resolver]
    F --> G[Authentication Check]
    G --> H{Authenticated?}
    H -->|No| I[Return Auth Error]
    
    H -->|Yes| J[Authorization Check]
    J --> K{Authorized?}
    K -->|No| L[Return Permission Error]
    
    K -->|Yes| M[Business Logic Validation]
    M --> N{Valid Business Rules?}
    N -->|No| O[Return Business Error]
    
    N -->|Yes| P[Database Operation]
    P --> Q{DB Operation Success?}
    Q -->|No| R[Return DB Error]
    Q -->|Yes| S[Success Response]
    
    I --> T[Frontend Error Handler]
    L --> T
    O --> T
    R --> T
    T --> U[Display User-Friendly Error]
    
    S --> V[Update UI State]
    D --> W[User Corrects Input]
    U --> X[User Takes Action]
    
    style A fill:#e3f2fd
    style S fill:#c8e6c9
    style T fill:#ffcdd2
    style U fill:#ffcdd2
```

This comprehensive set of Mermaid diagrams covers all major aspects of the Intelligent VMS system, providing detailed visualization of the architecture, data flow, user interactions, and technical implementation details.