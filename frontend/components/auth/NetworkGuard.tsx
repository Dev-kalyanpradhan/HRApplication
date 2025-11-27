import React from 'react';
interface Props { children: React.ReactNode }
const NetworkGuard: React.FC<Props> = ({ children }) => {
    return <>{children}</>;
};
export default NetworkGuard;
