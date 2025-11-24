"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

interface PromoModalState {
  isOpen: boolean;
  shouldShow: boolean;
  showModal: () => void;
  hideModal: () => void;
  dismissPermanently: () => void;
}

const PROMO_MODAL_STORAGE_KEY = "fleet-trace-promo-modal-dismissed";
const PROMO_MODAL_SHOW_DELAY = 3000; // 3 seconds after login

export function usePromoModal(): PromoModalState {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!user) {
      setShouldShow(false);
      setIsOpen(false);
      return;
    }

    // Check if user has permanently dismissed the modal
    const isDismissed =
      localStorage.getItem(PROMO_MODAL_STORAGE_KEY) === "true";

    if (isDismissed) {
      setShouldShow(false);
      return;
    }

    // Show modal for all authenticated users who haven't dismissed it
    // We'll show it to encourage participation regardless of submission count
    setShouldShow(true);

    // Show modal after a delay to let the dashboard load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, PROMO_MODAL_SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [user]);

  const showModal = () => {
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const dismissPermanently = () => {
    localStorage.setItem(PROMO_MODAL_STORAGE_KEY, "true");
    setIsOpen(false);
    setShouldShow(false);
  };

  return {
    isOpen,
    shouldShow,
    showModal,
    hideModal,
    dismissPermanently,
  };
}
