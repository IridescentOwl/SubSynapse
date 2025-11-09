// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";

import { AuroraBackground } from "./components/ui/aurora-background";

import Header from "./components/Header";
import HomePage from "./HomePage";
import DashboardPage from "./DashboardPage";
import ProfilePage from "./ProfilePage";
import ManageSubscriptionModal from "./components/ManageSubscriptionModal";
import CreateGroupModal from "./components/CreateGroupModal";
import JoinGroupModal from "./components/JoinGroupModal";
import AddCreditsModal from "./components/AddCreditsModal";
import AuthModal from "./components/AuthModal";
import WithdrawCreditsModal from "./components/WithdrawCreditsModal";

import type { MySubscription, SubscriptionGroup } from "./types";
import { useAuth } from "./AuthContext";

// Admin guards + pages
import AdminRoute from "./components/routes/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import GroupsPage from "./pages/admin/GroupsPage";
import WithdrawalsPage from "./pages/admin/WithdrawalsPage";

// ---------------------------------------------------------
// Your existing single-page app logic wrapped as MainShell
// ---------------------------------------------------------
export type Page = "home" | "dashboard" | "profile";
export type DashboardTab = "explore" | "dashboard";
export type AppState = "loading" | "panning" | "finished";

function MainShell() {
  const [page, setPage] = useState<Page>("home");
  const [activeDashboardTab, setActiveDashboardTab] =
    useState<DashboardTab>("explore");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [appState, setAppState] = useState<AppState>("loading");

  const {
    user,
    mySubscriptions,
    isAuthenticated,
    addCredits,
    joinGroup,
    leaveGroup,
    createGroup,
    requestWithdrawal,
    syncUserData,
    changePassword,
    updateProfilePicture,
  } = useAuth();

  // Modal States
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setJoinGroupModalOpen] = useState(false);
  const [isAddCreditsModalOpen, setAddCreditsModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState<SubscriptionGroup | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<MySubscription | null>(null);

  const lastScrollY = useRef(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setAppState("panning"), 1200);
    const timer2 = setTimeout(() => setAppState("finished"), 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (appState === "finished") {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [appState]);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthModalOpen(false);
      if (page === "home") setPage("dashboard");
    } else {
      setPage("home");
    }
  }, [isAuthenticated, page]);

  const handleLogout = () => {
    const { logout } = useAuth();
    logout();
    setPage("home");
    window.scrollTo(0, 0);
  };

  const handleNavigate = (newPage: Page, tab: DashboardTab = "explore") => {
    if ((newPage === "dashboard" || newPage === "profile") && !isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setPage(newPage);
    if (newPage === "dashboard") setActiveDashboardTab(tab);
    window.scrollTo(0, 0);
  };

  const handleOpenManageModal = (subscription: MySubscription) => {
    setSelectedSubscription(subscription);
    setManageModalOpen(true);
  };

  const handleOpenJoinModal = (group: SubscriptionGroup) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setGroupToJoin(group);
    setJoinGroupModalOpen(true);
  };

  const handleJoinGroup = async (subscription: MySubscription, cost: number) => {
    await joinGroup(subscription, cost);
  };

  const handleCloseJoinModalAndSync = () => {
    setJoinGroupModalOpen(false);
    syncUserData();
  };

  const handleLeaveGroup = async (subscriptionId: string, refund: number = 0) => {
    await leaveGroup(subscriptionId, refund);
    setManageModalOpen(false);
  };

  const handleAddCredits = async (amount: number) => {
    await addCredits(amount);
    setAddCreditsModalOpen(false);
  };

  const handleRequestWithdrawal = async (amount: number, upiId: string) => {
    await requestWithdrawal(amount, upiId);
    setWithdrawModalOpen(false);
  };

  const handleCreateGroup = async (
    groupData: Omit<SubscriptionGroup, "id" | "postedBy" | "slotsFilled">
  ) => {
    await createGroup(groupData);
    setCreateGroupModalOpen(false);
    handleNavigate("dashboard", "dashboard");
  };

  const handleOpenCreateGroupModal = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setCreateGroupModalOpen(true);
  };

  const renderPage = () => {
    const currentPage = isAuthenticated ? page : "home";
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            activeTab={activeDashboardTab}
            setActiveTab={setActiveDashboardTab}
            mySubscriptions={mySubscriptions || []}
            onManageSubscription={handleOpenManageModal}
            onJoinGroup={handleOpenJoinModal}
          />
        );
      case "profile":
        return user ? (
          <ProfilePage
            user={user}
            onAddCredits={() => setAddCreditsModalOpen(true)}
            onWithdrawCredits={() => setWithdrawModalOpen(true)}
            onChangePassword={changePassword}
            onUpdateProfilePicture={updateProfilePicture}
          />
        ) : null;
      case "home":
      default:
        return (
          <HomePage
            onLogin={() => setAuthModalOpen(true)}
            isReady={appState === "finished"}
          />
        );
    }
  };

  return (
    <AuroraBackground>
      <div className="relative z-10">
        <Header
          isVisible={isHeaderVisible}
          page={isAuthenticated ? page : "home"}
          user={user}
          activeDashboardTab={activeDashboardTab}
          onNavigate={handleNavigate}
          onLogin={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          appState={appState}
          onCreateGroup={handleOpenCreateGroupModal}
          onAddCredits={() => setAddCreditsModalOpen(true)}
        />
        {appState !== "loading" && renderPage()}
      </div>

      {selectedSubscription && (
        <ManageSubscriptionModal
          isOpen={isManageModalOpen}
          onClose={() => setManageModalOpen(false)}
          subscription={selectedSubscription}
          onLeaveGroup={handleLeaveGroup}
        />
      )}

      {groupToJoin && user && (
        <JoinGroupModal
          isOpen={isJoinGroupModalOpen}
          onClose={handleCloseJoinModalAndSync}
          group={groupToJoin}
          userCredits={user.creditBalance}
          onConfirmJoin={handleJoinGroup}
          onAddCredits={() => setAddCreditsModalOpen(true)}
        />
      )}

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <AddCreditsModal
        isOpen={isAddCreditsModalOpen}
        onClose={() => setAddCreditsModalOpen(false)}
        onAddCredits={handleAddCredits}
      />

      {user && (
        <WithdrawCreditsModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          userBalance={user.creditBalance}
          onConfirmWithdrawal={handleRequestWithdrawal}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AuroraBackground>
  );
}

// ---------------------------------------------------------
// Router wrapper: mounts MainShell on "/" and admin on "/admin/*"
// ---------------------------------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing experience (home/dashboard/profile handled internally) */}
        <Route path="/*" element={<MainShell />} />

        {/* Admin area (role-protected) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="withdrawals" element={<WithdrawalsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
