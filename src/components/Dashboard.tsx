import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  User,
  Trophy,
  Timer,
  Coins,
  Check,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserData {
  email: string;
  balance: number;
  hasClaimed: boolean;
}

interface DashboardProps {
  userData: UserData;
}

export function Dashboard({ userData }: DashboardProps) {
  // Simulamos la llamada a useEligibility por ahora
  const eligibilityData = {
    isEligible: true,
    eligibleDate: new Date().toISOString(),
    streakCount: 5,
    lastStreakDate: new Date().toISOString(),
  };
  const isCheckingEligibility = false;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="dashboard">
      {/* Account Info */}
      <div className="dashboard-section">
        <div className="dashboard-title">
          <User size={20} />
          Account Info
        </div>
        <div className="dashboard-value">
          {userData.email || 'Membership pending'}
        </div>
        <div className="dashboard-subtitle">
          {userData.email ? 'Email verificado' : 'Email pendiente de verificación'}
        </div>
      </div>

      {/* Streak Information */}
      <div className="dashboard-section">
        <div className="dashboard-title">
          <Trophy size={20} />
          Streak Information
        </div>
        <div className="dashboard-value">0</div>
        <div className="dashboard-subtitle">
          Streaks maintained
        </div>
        <div className="dashboard-subtitle">
          Last streak: N/A
        </div>
      </div>

      {/* Balance */}
      <div className="dashboard-section">
        <div className="dashboard-title">
          <Coins size={20} />
          Balance
        </div>
        <div className="dashboard-value">50 tokens</div>
        <div className="dashboard-subtitle">
          Available for use
        </div>
      </div>

      {/* Claim Status */}
      <div className="dashboard-section claim-section">
        <div className="claim-status-header">
          <div className="dashboard-title">
            Claim Status
          </div>
          <div className="dashboard-subtitle">
            Not eligible for claiming
          </div>
        </div>
        <div className="claim-button-container">
          <button className="claim-button" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Claim
          </button>
        </div>
      </div>
    </div>
  );
} 