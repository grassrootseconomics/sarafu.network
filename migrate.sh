mkdir -p src/app
git mv src/pages/_app.tsx src/app/layout.tsx
git mv src/pages/_document.tsx src/app/head.tsx
git mv src/pages/api src/app/api
mkdir -p src/app/404
git mv src/pages/404.tsx src/app/404/page.tsx

mkdir -p src/app/dashboard
git mv src/pages/dashboard/index.tsx src/app/dashboard/page.tsx

git mv src/pages/index.tsx src/app/page.tsx

mkdir -p src/app/paper/generate
git mv src/pages/paper/generate.tsx src/app/paper/generate/page.tsx

mkdir -p src/app/pools
git mv src/pages/pools/index.tsx src/app/pools/page.tsx
git mv src/pages/pools/create.tsx src/app/pools/create/page.tsx
mkdir -p src/app/pools/[address]
git mv src/pages/pools/[address].tsx src/app/pools/[address]/page.tsx

mkdir -p src/app/staff
git mv src/pages/staff/index.tsx src/app/staff/page.tsx

mkdir -p src/app/terms-and-conditions
git mv src/pages/terms-and-conditions.tsx src/app/terms-and-conditions/page.tsx

mkdir -p src/app/vouchers
git mv src/pages/vouchers/index.tsx src/app/vouchers/page.tsx
git mv src/pages/vouchers/create.tsx src/app/vouchers/create/page.tsx
mkdir -p src/app/vouchers/[address]
git mv src/pages/vouchers/[address]/index.tsx src/app/vouchers/[address]/page.tsx

mkdir -p src/app/wallet
git mv src/pages/wallet/index.tsx src/app/wallet/page.tsx
git mv src/pages/wallet/explore.tsx src/app/wallet/explore/page.tsx
git mv src/pages/wallet/profile.tsx src/app/wallet/profile/page.tsx