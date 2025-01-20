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
          <User className="w-5 h-5" />
          <span>Account Info</span>
        </div>
        <div className="dashboard-value">Membership pending</div>
        <div className="dashboard-subtitle">{userData.email}</div>
      </div>

      {/* Streak Information */}
      <div className="dashboard-section">
        <div className="dashboard-title">
          <Trophy className="w-5 h-5" />
          <span>Streak Information</span>
        </div>
        <div className="dashboard-value">0</div>
        <div className="dashboard-subtitle">Streaks maintained</div>
        <div className="dashboard-subtitle">Last streak: N/A</div>
      </div>

      {/* Balance */}
      <div className="dashboard-section">
        <div className="dashboard-title">
          <Coins className="w-5 h-5" />
          <span>Balance</span>
        </div>
        <div className="dashboard-value">50 tokens</div>
        <div className="dashboard-subtitle">Available for use</div>
      </div>

      {/* Claim Status */}
      <div className="dashboard-section claim-section">
        <div className="claim-status-header">
          <div className="dashboard-title">Claim Status</div>
          <div className="dashboard-subtitle">Not eligible for claiming</div>
        </div>
        <div className="claim-button-container">
          <button
            disabled={true}
            className="claim-button"
          >
            <Check className="w-4 h-4" />
            Claim
          </button>
        </div>
      </div>
    </div>
  );
} 