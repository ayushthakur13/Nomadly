import type { ReactNode } from 'react';

interface Props { children: ReactNode }

const PublicRoute = ({ children }: Props) => {
  return children as React.ReactElement;
};

export default PublicRoute;
