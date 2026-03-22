import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const PageShell: React.FC<Props> = ({ children }) => (
  <div className="max-w-[1100px] mx-auto px-6 py-8">{children}</div>
);
