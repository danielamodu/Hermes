'use client';

import { createAppKit } from '@reown/appkit/react';
import { mainnet } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';

// 1. Get projectId from environment or fallback to dummy ID
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '1df92f019a1c4beeb6f618bc317f5dce';

// 2. Set up metadata
const metadata = {
  name: 'Hermes',
  description: 'Portaldot Developer Agent Workspace',
  url: 'https://hermes.sys',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Initialize AppKit
createAppKit({
  networks: [mainnet],
  projectId,
  metadata
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
