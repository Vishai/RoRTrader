'use client';

import { BotCreationWizard } from '@/components/bots';

export default function NewBotPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <BotCreationWizard />
    </div>
  );
}
