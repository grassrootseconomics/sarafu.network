import { type Metadata } from 'next'
import VouchersPageClient from '~/components/voucher/vouchers-page'

export const metadata: Metadata = {
  title: 'Vouchers - Sarafu Network',
  description: 'Explore Sarafu Network Vouchers',
  openGraph: {
    title: 'Sarafu Network Vouchers',
    description: 'Explore community asset vouchers on Sarafu Network',
  },
}

export default function VouchersPage() {
  return <VouchersPageClient />
}