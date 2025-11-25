
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, WifiOff, RefreshCw, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { WorkLocation, UserRole } from '../../types';

// --- Configuration ---
// In a real-world application, this would come from an environment variable.
// NOTE: The IP below appears to be a local/private network IP (192.168.x.x). 
// The application currently checks your PUBLIC IP address by default. 
// For this check to work, you may need to replace this with your office's public IP address,
// which you can find by searching "what is my ip" on Google while on the office network.
const ALLOWED_IP = '117.96.227.52'; // Updated based on user's office WiFi details.

type Status = 'verifying' | 'authorized' | 'unauthorized' | 'error';

interface NetworkGuardProps {
    children: React.ReactNode;
}

const NetworkGuard: React.FC<NetworkGuardProps> = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const [status, setStatus] = useState<Status>('verifying');
    const [userIp, setUserIp] = useState<string | null>(null);

    const verifyIp = useCallback(async () => {
        setStatus('verifying');

        // Exemption checks: Admins, individually exempt users, and Work from Home users bypass the check.
        if (
            currentUser?.userRole === UserRole.ADMIN ||
            currentUser?.ipRestrictionExempt ||
            currentUser?.workLocation === WorkLocation.HOME
        ) {
            setStatus('authorized');
            return;
        }


        try {
            // Use a free public IP API. In a real scenario, you might have your own endpoint.
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) {
                throw new Error('Could not fetch IP address.');
            }
            const data = await response.json();
            const fetchedIp = data.ip;
            setUserIp(fetchedIp);
            
            // For demonstration, we'll also allow localhost access.
            if (fetchedIp === ALLOWED_IP || ['127.0.0.1', '::1'].includes(window.location.hostname)) {
                setStatus('authorized');
            } else {
                setStatus('unauthorized');
            }
        } catch (error) {
            console.error("IP verification failed:", error);
            setStatus('error');
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            verifyIp();
        }
    }, [verifyIp, currentUser]);


    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
                <Loader size={48} className="animate-spin text-blue-600" />
                <h2 className="mt-4 text-xl font-semibold text-slate-700">Verifying network connection...</h2>
                <p className="text-slate-500">Please wait while we ensure a secure connection.</p>
            </div>
        );
    }

    if (status === 'authorized') {
        return <>{children}</>;
    }

    // Render unauthorized or error state
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 p-4">
            <div className="w-full max-w-lg text-center bg-white p-8 rounded-xl shadow-lg">
                <WifiOff size={56} className="mx-auto text-red-500" />
                <h1 className="mt-4 text-3xl font-bold text-slate-800">Access Denied</h1>
                <p className="mt-2 text-slate-600">
                    Access to this application is restricted to the company's secure network for your account. 
                    Please connect to the office Wi-Fi or contact an administrator if you believe this is an error.
                </p>
                {userIp && status === 'unauthorized' && (
                     <p className="mt-4 text-xs text-slate-400 bg-slate-100 p-2 rounded">
                        Your current IP: {userIp} | Required IP: {ALLOWED_IP}
                    </p>
                )}
                {status === 'error' && (
                     <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
                        Could not verify your network connection. Please check your internet and try again.
                    </p>
                )}

                <div className="mt-8 flex justify-center gap-4">
                    <Button variant="secondary" onClick={() => logout()} leftIcon={<LogOut size={16} />}>
                        Logout
                    </Button>
                    <Button onClick={verifyIp} leftIcon={<RefreshCw size={16} />}>
                        Retry Connection
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NetworkGuard;
