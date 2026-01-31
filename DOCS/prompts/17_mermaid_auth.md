```mermaid
graph TD
    subgraph "User (Browser)"
        A[Access Application]
        B[Navigate to /register]
        C[Fill Register Form]
        D[Navigate to /login]
        E[Fill Login Form]
        F[Click Logout]
        G[Access Protected Page]
        H[Navigate to /forgot-password]
        I[Fill Forgot Password Form]
        J[Receive Recovery Email]
        K[Click Recovery Link]
        L[Fill Update Password Form]
    end

    subgraph "Astro Frontend (Pages & Components)"
        P1(src/pages/register.astro)
        P2(src/pages/login.astro)
        P3(src/pages/forgot-password.astro)
        P4(src/pages/update-password.astro)
        C1(src/components/auth/RegisterForm.tsx)
        C2(src/components/auth/LoginForm.tsx)
        C3(src/components/auth/ForgotPasswordForm.tsx)
        C4(src/components/auth/UpdatePasswordForm.tsx)
        L1(src/layouts/AuthLayout.astro)
        L2(src/layouts/Layout.astro)
        H1(src/components/Header.astro)
        PP(Protected Astro Pages - e.g., /list, /prompts/new)
    end

    subgraph "Astro Middleware (src/middleware/index.ts)"
        M1{Check Auth Status via Astro.locals.auth}
        M2[Set Astro.locals.user & supabase client]
        M3{Redirect if Unauthenticated (to /login)}
        M4{Redirect if Authenticated on Auth Pages (to /list)}
    end

    subgraph "Supabase Client (Client-side & Server-side)"
        SC1(src/db/supabase.client.ts - Client-side)
        SC2(Server-side Supabase Client in Middleware)
    end

    subgraph "Supabase Backend"
        SB1[Supabase Auth (API)]
        SB2[Supabase Database (auth.users, public.profiles)]
    end

    %% Initial Access
    A --> P2

    %% Flow: Registration
    B --> P1
    P1 -- renders --> C1
    C1 --> SC1: `supabase.auth.signUp()` + `insert()` profile
    SC1 --> SB1
    SB1 --> SB2
    SB2 -- user & profile created --> SB1
    SB1 --> SC1 -- success, sets session cookies --> C1 -- client redirect --> PP

    %% Flow: Login
    D --> P2
    P2 -- renders --> C2
    C2 --> SC1: `supabase.auth.signInWithPassword()`
    SC1 --> SB1
    SB1 --> SB2
    SB2 -- session valid --> SB1
    SB1 --> SC1 -- success, sets session cookies --> C2 -- client redirect --> PP

    %% Flow: Logout
    H1 --> F[Click Logout button]
    F --> SC1: `supabase.auth.signOut()`
    SC1 --> SB1
    SB1 -- clears session cookies --> SC1 -- success --> P2

    %% Flow: Protected Route Access
    G --> PP
    PP -- incoming request --> M1
    M1 -- reads session cookies --> SC2
    SC2 -- verifies session --> SB1
    SB1 -- session info --> SC2
    SC2 --> M1
    M1 -- no session found --> M3
    M3 -- server redirect --> P2
    M1 -- session valid --> M2
    M2 --> PP -- render with user data --> H1

    %% Flow: Handling Authenticated users on Auth Pages
    D --> M1
    M1 -- session valid --> M4
    M4 -- server redirect --> PP
    B --> M1
    M1 -- session valid --> M4
    M4 -- server redirect --> PP

    %% Flow: Password Recovery
    H --> P3
    P3 -- renders --> C3
    C3 --> SC1: `supabase.auth.resetPasswordForEmail()`
    SC1 --> SB1
    SB1 -- sends email --> J
    J --> K
    K --> P4
    P4 -- renders --> C4
    C4 --> SC1: `supabase.auth.updateUser()` (uses recovery session)
    SC1 --> SB1
    SB1 --> SB2
    SB2 -- password updated --> SB1
    SB1 --> SC1 -- success --> P2

    %% Layouts
    P1, P2, P3, P4 -- uses --> L1
    PP -- uses --> L2
    L2 -- contains --> H1

    %% Existing connections/components
    SC1 -. uses .-> src/env.d.ts (for env vars)
    SC2 -. uses .-> src/env.d.ts (for types/env vars)
    M1 -. populates .-> Astro.locals (via src/env.d.ts)
    M2 -. populates .-> Astro.locals (via src/env.d.ts)

    style M1 fill:#f9f,stroke:#333,stroke-width:2px
    style M3 fill:#f9f,stroke:#333,stroke-width:2px
    style M4 fill:#f9f,stroke:#333,stroke-width:2px
```
