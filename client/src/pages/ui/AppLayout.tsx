import { Outlet, useNavigation } from "react-router-dom";
import { Suspense } from "react";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Toaster } from "../../components/ui/Toaster";
import { ErrorBoundary } from "../../components/common/ErrorBoundary";

export default function AppLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {isLoading && <Loader />}
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
