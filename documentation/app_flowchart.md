flowchart TD
  A[Start] --> B[User visits application]
  B --> C{Authenticated}
  C -- No --> D[Login Page]
  D --> E[Supabase Auth]
  E --> C
  C -- Yes --> F{User Role}
  F -- Admin --> G[Admin Dashboard]
  F -- Viewer --> H[Display Portal]
  G --> I[Perform CRUD]
  I --> J[Server Action writes to Database]
  J --> K[Supabase Realtime Broadcast]
  K --> O[Realtime Subscription on Display]
  H --> O
  O --> L[Update Display State]
  H --> M[Fallback Refresh every 60s]
  M --> L
  G --> N[Trigger revalidatePath]