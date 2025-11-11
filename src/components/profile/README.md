# Profile Components

Reusable components for displaying public user profiles in the Sarafu Network application.

## Components

### ProfileHeader

Displays user profile information with avatar, name, location, and action buttons.

**Features:**
- User avatar with Identicon fallback
- Display name and location
- Address with copy functionality
- Action buttons: Copy address, Share profile, Show QR code
- Mobile-first responsive design

**Props:**
```typescript
interface ProfileHeaderProps {
  user: PublicProfile;
  address: string;
}

interface PublicProfile {
  given_names: string | null;
  location_name: string | null;
  address: string;
  avatar: string | null;
}
```

**Example:**
```tsx
import { ProfileHeader } from "~/components/profile";

function ProfilePage() {
  const user = {
    given_names: "John Doe",
    location_name: "Nairobi, Kenya",
    address: "0x1234...",
    avatar: null,
  };

  return <ProfileHeader user={user} address={user.address} />;
}
```

---

### ProfileTabs

Tab navigation component with URL query param synchronization.

**Features:**
- Three tabs: Transactions, Vouchers, Pools
- URL query param sync (e.g., ?tab=vouchers)
- Mobile-responsive tab navigation
- Active state styling

**Props:**
```typescript
interface ProfileTabsProps {
  transactionsContent: React.ReactNode;
  vouchersContent: React.ReactNode;
  poolsContent: React.ReactNode;
  defaultTab?: ProfileTab; // "transactions" | "vouchers" | "pools"
}
```

**Example:**
```tsx
import { ProfileTabs, UserTransactionList, UserVoucherGrid, UserPoolList } from "~/components/profile";

function ProfilePage({ address }: { address: string }) {
  return (
    <ProfileTabs
      transactionsContent={<UserTransactionList address={address} />}
      vouchersContent={<UserVoucherGrid address={address} />}
      poolsContent={<UserPoolList address={address} />}
      defaultTab="transactions"
    />
  );
}
```

---

### UserTransactionList

Displays user transactions with infinite scroll and filtering.

**Features:**
- Fetches transactions via tRPC `profile.getUserTransactions`
- Infinite scroll pagination
- Filter by: All, Sent, Received
- Loading states with skeletons
- Empty state
- Transaction details with amount, token, and timestamp

**Props:**
```typescript
interface UserTransactionListProps {
  address: string;
}
```

**Example:**
```tsx
import { UserTransactionList } from "~/components/profile";

function TransactionsTab({ address }: { address: string }) {
  return <UserTransactionList address={address} />;
}
```

---

### UserVoucherGrid

Displays user vouchers in a responsive grid layout.

**Features:**
- Fetches vouchers via tRPC `profile.getUserVouchers`
- Responsive grid (1-4 columns)
- Voucher cards with icon, symbol, and name
- Links to voucher detail pages
- Loading skeletons
- Empty state

**Props:**
```typescript
interface UserVoucherGridProps {
  address: string;
}
```

**Example:**
```tsx
import { UserVoucherGrid } from "~/components/profile";

function VouchersTab({ address }: { address: string }) {
  return <UserVoucherGrid address={address} />;
}
```

---

### UserPoolList

Displays swap pools where the user has interacted.

**Features:**
- Fetches pools via tRPC `profile.getUserPools`
- Grid layout with responsive columns
- Pool cards with banner, name, symbol, and description
- Links to pool detail pages
- Loading states
- Empty state

**Props:**
```typescript
interface UserPoolListProps {
  address: string;
}
```

**Example:**
```tsx
import { UserPoolList } from "~/components/profile";

function PoolsTab({ address }: { address: string }) {
  return <UserPoolList address={address} />;
}
```

---

### ProfileSkeleton

Loading skeleton that matches the profile layout.

**Features:**
- Header section skeleton
- Tabs navigation skeleton
- Content area with placeholder items

**Example:**
```tsx
import { ProfileSkeleton } from "~/components/profile";

function ProfilePage() {
  const { data: user, isLoading } = trpc.profile.getPublicProfile.useQuery({ address });

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div>
      <ProfileHeader user={user} address={address} />
      {/* ... rest of profile */}
    </div>
  );
}
```

---

## Complete Example

Here's a complete example of how to use all components together:

```tsx
"use client";

import { useParams } from "next/navigation";
import {
  ProfileHeader,
  ProfileTabs,
  UserTransactionList,
  UserVoucherGrid,
  UserPoolList,
  ProfileSkeleton,
} from "~/components/profile";
import { trpc } from "~/lib/trpc";

export default function PublicProfilePage() {
  const params = useParams();
  const address = params.address as string;

  const { data: user, isLoading, error } = trpc.profile.getPublicProfile.useQuery(
    { address },
    { enabled: Boolean(address) }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground">The requested profile does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <ProfileHeader user={user} address={address} />

      <ProfileTabs
        transactionsContent={<UserTransactionList address={address} />}
        vouchersContent={<UserVoucherGrid address={address} />}
        poolsContent={<UserPoolList address={address} />}
        defaultTab="transactions"
      />
    </div>
  );
}
```

## Required tRPC Endpoints

These components require the following tRPC endpoints to be available:

1. **profile.getPublicProfile** - Fetches public user profile data
2. **profile.getUserTransactions** - Fetches user transactions with pagination
3. **profile.getUserVouchers** - Fetches vouchers associated with the user
4. **profile.getUserPools** - Fetches pools where the user has interacted

All endpoints are implemented in `/src/server/api/routers/profile.ts`.

## Styling

Components use:
- Tailwind CSS utility classes
- Radix UI primitives
- Design tokens from the project theme
- Mobile-first responsive design
- Dark mode support (automatic via theme)

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA labels and attributes
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Color contrast compliance
