import { RECOVERY_PLANS } from '@/lib/data';
import { notFound } from 'next/navigation';
import RecoveryPlanClient from '@/components/feature/recovery-plan';

type PlanPageProps = {
  params: {
    condition: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export function generateStaticParams() {
    return Object.keys(RECOVERY_PLANS).map((condition) => ({
      condition,
    }));
}

export default function PlanPage({ params, searchParams }: PlanPageProps) {
  const { condition } = params;
  const plan = RECOVERY_PLANS[condition];

  if (!plan) {
    notFound();
  }

  // For dynamic plans, the name is passed as a query parameter
  const dynamicName = searchParams?.name as string | undefined;
  const planName = dynamicName || plan.name;

  return <RecoveryPlanClient planName={planName} condition={condition} />;
}
