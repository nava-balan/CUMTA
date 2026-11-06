// Global Store — CHENNAI 360 | One City. Infinite Possibilities.
// Central state management for WATERLINK, ROADWATCH, and TRANSITPULSE modules

import React, { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { ferryFleet, type Ferry } from '../data/ferryFleet';
import { mockHazardReports, type HazardReport, type HazardSeverity, type VerificationStatus } from '../data/hazardData';

export type AppMode = 'waterlink' | 'roadwatch' | 'transitpulse';
export type UserRole = 'commuter' | 'admin';

export interface BookedTicket {
  id: string;
  routeId: number;
  routeName: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  passengerName: string;
  passengerCount: number;
  vesselClass: 'Eco-Catamaran' | 'Business Hydrofoil';
  baseFare: number;
  pointsDiscount: number;
  fare: number;
  bookedAt: string;
  qrCode: string;
  status: 'confirmed' | 'boarded' | 'completed';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface MapTarget {
  lat: number;
  lng: number;
  zoom: number;
  timestamp: number;
}

export interface DedupBannerInfo {
  message: string;
  reportId: string;
  severity: HazardSeverity;
}

export interface GlobalState {
  appMode: AppMode;
  userRole: UserRole;
  civicPoints: number;
  totalRevenue: number;
  totalPassengers: number;
  daysInOperation: number;
  tickets: BookedTicket[];
  hazardReports: HazardReport[];
  ferries: Ferry[];
  toasts: Toast[];
  mapTarget: MapTarget | null;
  activeTicketModal: BookedTicket | null;
  isDriverAlertActive: boolean;
  activeDetourVisible: boolean;
  dedupBanner: DedupBannerInfo | null;
}

type GlobalAction =
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'BOOK_TICKET'; payload: Omit<BookedTicket, 'id' | 'bookedAt' | 'qrCode' | 'status'> }
  | { type: 'ADD_HAZARD_REPORT'; payload: Omit<HazardReport, 'id' | 'upvotes' | 'duplicateCount' | 'verificationStatus' | 'rewardPoints'> }
  | { type: 'VERIFY_REPORT'; payload: { reportId: string; status: VerificationStatus } }
  | { type: 'ESCALATE_SEVERITY'; payload: { reportId: string; newSeverity: HazardSeverity; incrementDuplicates?: boolean } }
  | { type: 'ADD_CIVIC_POINTS'; payload: number }
  | { type: 'SET_MAP_TARGET'; payload: MapTarget }
  | { type: 'SET_ACTIVE_TICKET_MODAL'; payload: BookedTicket | null }
  | { type: 'SET_DRIVER_ALERT'; payload: { active: boolean; showDetour: boolean } }
  | { type: 'SET_DEDUP_BANNER'; payload: DedupBannerInfo | null }
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'UPDATE_FERRIES'; payload: Ferry[] }
  | { type: 'SYNC_FROM_BACKEND'; payload: Partial<GlobalState> };

let ticketCounter = 1042;
let hazardCounter = 720;
let toastCounter = 0;

function generateTicketId(): string {
  ticketCounter += 1;
  return `WL-TKT-${ticketCounter}`;
}

function generateHazardId(): string {
  hazardCounter += 1;
  return `HZR-${hazardCounter}`;
}

function generateToastId(): string {
  toastCounter += 1;
  return `toast-${toastCounter}-${Date.now()}`;
}

function generateQrCode(ticketId: string): string {
  return `CHN360::${ticketId}::VALID`;
}

const initialState: GlobalState = {
  appMode: 'waterlink',
  userRole: 'commuter',
  civicPoints: 350,
  totalRevenue: 2847500,
  totalPassengers: 18420,
  daysInOperation: 47,
  tickets: [
    {
      id: 'WL-TKT-1038',
      routeId: 1,
      routeName: 'Adyar River Corridor',
      fromStation: 'Saidapet',
      toStation: 'Srinivasapuram / Boat Club',
      departureTime: '11:15',
      passengerName: 'Karthik Raja',
      passengerCount: 1,
      vesselClass: 'Eco-Catamaran',
      baseFare: 45,
      pointsDiscount: 0,
      fare: 45,
      bookedAt: '2026-11-05T10:45:00.000Z',
      qrCode: 'CHN360::WL-TKT-1038::VALID',
      status: 'confirmed',
    },
    {
      id: 'WL-TKT-1039',
      routeId: 2,
      routeName: 'Cooum River Corridor',
      fromStation: 'Koyambedu',
      toStation: 'Napier Bridge / Marina',
      departureTime: '12:00',
      passengerName: 'Ananya S',
      passengerCount: 2,
      vesselClass: 'Business Hydrofoil',
      baseFare: 140,
      pointsDiscount: 20,
      fare: 120,
      bookedAt: '2026-11-05T11:20:00.000Z',
      qrCode: 'CHN360::WL-TKT-1039::VALID',
      status: 'confirmed',
    },
  ],
  hazardReports: [...mockHazardReports],
  ferries: [...ferryFleet],
  toasts: [],
  mapTarget: null,
  activeTicketModal: null,
  isDriverAlertActive: false,
  activeDetourVisible: false,
  dedupBanner: null,
};

function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_APP_MODE':
      return { ...state, appMode: action.payload };

    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };

    case 'BOOK_TICKET': {
      const ticketId = generateTicketId();
      const newTicket: BookedTicket = {
        ...action.payload,
        id: ticketId,
        bookedAt: new Date().toISOString(),
        qrCode: generateQrCode(ticketId),
        status: 'confirmed',
      };
      // If civic points were redeemed for a discount, deduct them from balance
      const updatedCivicPoints = Math.max(0, state.civicPoints - (newTicket.pointsDiscount || 0));
      return {
        ...state,
        tickets: [newTicket, ...state.tickets],
        totalRevenue: state.totalRevenue + newTicket.fare,
        totalPassengers: state.totalPassengers + newTicket.passengerCount,
        activeTicketModal: newTicket,
        civicPoints: updatedCivicPoints,
      };
    }

    case 'ADD_HAZARD_REPORT': {
      const newReport: HazardReport = {
        ...action.payload,
        id: generateHazardId(),
        upvotes: 1,
        duplicateCount: 0,
        verificationStatus: 'pending-ai',
        rewardPoints: action.payload.severity === 'critical' ? 50 : 25,
      };
      const isCriticalOrHigh = newReport.severity === 'critical' || newReport.severity === 'high';
      return {
        ...state,
        hazardReports: [newReport, ...state.hazardReports],
        // Do NOT grant civic points upon submission. Points are strictly awarded only upon municipal verification.
        isDriverAlertActive: isCriticalOrHigh ? true : state.isDriverAlertActive,
        activeDetourVisible: isCriticalOrHigh ? true : state.activeDetourVisible,
      };
    }

    case 'VERIFY_REPORT': {
      const { reportId, status } = action.payload;
      let awardedPoints = 0;
      const updatedReports = state.hazardReports.map((r) => {
        if (r.id === reportId) {
          if (status === 'verified' && r.verificationStatus !== 'verified') {
            awardedPoints = 100;
          }
          return { ...r, verificationStatus: status };
        }
        return r;
      });
      return {
        ...state,
        hazardReports: updatedReports,
        civicPoints: state.civicPoints + awardedPoints,
      };
    }

    case 'ESCALATE_SEVERITY': {
      const { reportId, newSeverity, incrementDuplicates = true } = action.payload;
      const updatedReports = state.hazardReports.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            severity: newSeverity,
            duplicateCount: incrementDuplicates ? r.duplicateCount + 1 : r.duplicateCount,
            upvotes: r.upvotes + 1,
          };
        }
        return r;
      });
      return {
        ...state,
        hazardReports: updatedReports,
        isDriverAlertActive: newSeverity === 'critical' || newSeverity === 'high' ? true : state.isDriverAlertActive,
        activeDetourVisible: newSeverity === 'critical' || newSeverity === 'high' ? true : state.activeDetourVisible,
      };
    }

    case 'ADD_CIVIC_POINTS':
      return { ...state, civicPoints: state.civicPoints + action.payload };

    case 'SET_MAP_TARGET':
      return { ...state, mapTarget: action.payload };

    case 'SET_ACTIVE_TICKET_MODAL':
      return { ...state, activeTicketModal: action.payload };

    case 'SET_DRIVER_ALERT':
      return {
        ...state,
        isDriverAlertActive: action.payload.active,
        activeDetourVisible: action.payload.showDetour,
      };

    case 'SET_DEDUP_BANNER':
      return { ...state, dedupBanner: action.payload };

    case 'ADD_TOAST': {
      const newToast: Toast = {
        ...action.payload,
        id: generateToastId(),
      };
      return { ...state, toasts: [...state.toasts, newToast] };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case 'UPDATE_FERRIES':
      return { ...state, ferries: action.payload };

    case 'SYNC_FROM_BACKEND':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

interface GlobalContextValue {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  setAppMode: (mode: AppMode) => void;
  setUserRole: (role: UserRole) => void;
  bookTicket: (ticket: Omit<BookedTicket, 'id' | 'bookedAt' | 'qrCode' | 'status'>) => void;
  addHazardReport: (report: Omit<HazardReport, 'id' | 'upvotes' | 'duplicateCount' | 'verificationStatus' | 'rewardPoints'>) => void;
  verifyReport: (reportId: string, status: VerificationStatus) => void;
  escalateSeverity: (reportId: string, newSeverity: HazardSeverity, incrementDuplicates?: boolean) => void;
  addCivicPoints: (points: number) => void;
  setMapTarget: (target: MapTarget) => void;
  setActiveTicketModal: (ticket: BookedTicket | null) => void;
  setDriverAlert: (active: boolean, showDetour: boolean) => void;
  setDedupBanner: (banner: DedupBannerInfo | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (toastId: string) => void;
  updateFerries: (ferries: Ferry[]) => void;
  // Demo Actions
  triggerDuplicatePotholeDemo: () => void;
  triggerMTCDriverDetourDemo: () => void;
  triggerWaterLinkTicketDemo: () => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Sync initial dataset from JSON backend on startup
  useEffect(() => {
    fetch('/api/data')
      .then((res) => {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          dispatch({
            type: 'SYNC_FROM_BACKEND',
            payload: {
              ...(Array.isArray(data.tickets) && { tickets: data.tickets }),
              ...(Array.isArray(data.hazardReports) && { hazardReports: data.hazardReports }),
              ...(Array.isArray(data.ferries) && { ferries: data.ferries }),
              ...(typeof data.civicPoints === 'number' && { civicPoints: data.civicPoints }),
              ...(typeof data.totalRevenue === 'number' && { totalRevenue: data.totalRevenue }),
              ...(typeof data.totalPassengers === 'number' && { totalPassengers: data.totalPassengers }),
              ...(typeof data.daysInOperation === 'number' && { daysInOperation: data.daysInOperation }),
            },
          });
        }
      })
      .catch((err) => {
        console.info('[CUMTA] Using offline/cached JSON state:', err?.message || err);
      });
  }, []);

  const setAppMode = useCallback((mode: AppMode) => {
    dispatch({ type: 'SET_APP_MODE', payload: mode });
  }, []);

  const setUserRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_USER_ROLE', payload: role });
  }, []);

  const bookTicket = useCallback((ticket: Omit<BookedTicket, 'id' | 'bookedAt' | 'qrCode' | 'status'>) => {
    dispatch({ type: 'BOOK_TICKET', payload: ticket });
    // Asynchronously persist ticket to JSON backend
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    }).catch(() => {});
  }, []);

  const addHazardReport = useCallback((report: Omit<HazardReport, 'id' | 'upvotes' | 'duplicateCount' | 'verificationStatus' | 'rewardPoints'>) => {
    dispatch({ type: 'ADD_HAZARD_REPORT', payload: report });
    // Asynchronously persist report to JSON backend
    fetch('/api/hazards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }).catch(() => {});
  }, []);

  const verifyReport = useCallback((reportId: string, status: VerificationStatus) => {
    dispatch({ type: 'VERIFY_REPORT', payload: { reportId, status } });
    // Asynchronously update status in JSON backend
    fetch('/api/hazards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action: 'verify', status }),
    }).catch(() => {});
  }, []);

  const escalateSeverity = useCallback((reportId: string, newSeverity: HazardSeverity, incrementDuplicates = true) => {
    dispatch({ type: 'ESCALATE_SEVERITY', payload: { reportId, newSeverity, incrementDuplicates } });
    // Asynchronously escalate in JSON backend
    fetch('/api/hazards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action: 'escalate', newSeverity }),
    }).catch(() => {});
  }, []);

  const addCivicPoints = useCallback((points: number) => {
    dispatch({ type: 'ADD_CIVIC_POINTS', payload: points });
  }, []);

  const setMapTarget = useCallback((target: MapTarget) => {
    dispatch({ type: 'SET_MAP_TARGET', payload: target });
  }, []);

  const setActiveTicketModal = useCallback((ticket: BookedTicket | null) => {
    dispatch({ type: 'SET_ACTIVE_TICKET_MODAL', payload: ticket });
  }, []);

  const setDriverAlert = useCallback((active: boolean, showDetour: boolean) => {
    dispatch({ type: 'SET_DRIVER_ALERT', payload: { active, showDetour } });
  }, []);

  const setDedupBanner = useCallback((banner: DedupBannerInfo | null) => {
    dispatch({ type: 'SET_DEDUP_BANNER', payload: banner });
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    dispatch({ type: 'ADD_TOAST', payload: toast });
  }, []);

  const removeToast = useCallback((toastId: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: toastId });
  }, []);

  const updateFerries = useCallback((ferries: Ferry[]) => {
    dispatch({ type: 'UPDATE_FERRIES', payload: ferries });
  }, []);

  // ─── Judge Demo 1: Test Duplicate Pothole (Saidapet) ──────────────────────
  const triggerDuplicatePotholeDemo = useCallback(() => {
    dispatch({ type: 'SET_APP_MODE', payload: 'roadwatch' });
    dispatch({
      type: 'SET_MAP_TARGET',
      payload: { lat: 13.0213, lng: 80.2231, zoom: 16, timestamp: Date.now() },
    });

    const target = state.hazardReports.find(
      (r) => r.category === 'potholes' || r.id === 'HZR-701'
    ) || state.hazardReports[0];

    dispatch({
      type: 'ESCALATE_SEVERITY',
      payload: { reportId: target.id, newSeverity: 'critical', incrementDuplicates: true },
    });

    dispatch({
      type: 'SET_DEDUP_BANNER',
      payload: {
        message: 'Issue already reported in this sector. Report forwarded to Admin and severity escalated for priority municipal action.',
        reportId: target.id,
        severity: 'critical',
      },
    });

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        type: 'warning',
        title: '50m Spatial De-Duplication Triggered',
        message: `Duplicate Pothole Report merged for #${target.id} at Saidapet. Severity escalated to CRITICAL. Pending municipal verification for +100 Civic Points.`,
      },
    });
  }, [state.hazardReports]);

  // ─── Judge Demo 2: Test MTC Driver Detour (T. Nagar) ──────────────────────
  const triggerMTCDriverDetourDemo = useCallback(() => {
    dispatch({ type: 'SET_APP_MODE', payload: 'roadwatch' });
    dispatch({
      type: 'SET_MAP_TARGET',
      payload: { lat: 13.0418, lng: 80.2341, zoom: 16, timestamp: Date.now() },
    });

    dispatch({
      type: 'SET_DRIVER_ALERT',
      payload: { active: true, showDetour: true },
    });

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        type: 'error',
        title: 'MTC Driver Detour Broadcast Active',
        message: 'Critical hazard at T. Nagar (Usman Rd). Danger perimeter plotted and MTC Bus Detour Route displayed on map.',
      },
    });
  }, []);

  // ─── Judge Demo 3: Test WaterLink Ticket & Ledger ─────────────────────────
  const triggerWaterLinkTicketDemo = useCallback(() => {
    dispatch({ type: 'SET_APP_MODE', payload: 'waterlink' });
    dispatch({
      type: 'SET_MAP_TARGET',
      payload: { lat: 13.0213, lng: 80.2231, zoom: 14, timestamp: Date.now() },
    });

    const ticketPayload = {
      routeId: 1,
      routeName: 'Adyar River Corridor',
      fromStation: 'Saidapet',
      toStation: 'Srinivasapuram / Boat Club',
      departureTime: '14:30',
      passengerName: 'Judge Evaluator',
      passengerCount: 1,
      vesselClass: 'Eco-Catamaran' as const,
      baseFare: 45,
      pointsDiscount: 0,
      fare: 45,
    };

    dispatch({ type: 'BOOK_TICKET', payload: ticketPayload });

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        type: 'success',
        title: 'WaterLink Ticket Issued',
        message: 'Saidapet to Srinivasapuram ticket booked. Boarding pass generated. Revenue (+₹45) and Passengers (+1) updated in TRANSITPULSE.',
      },
    });
  }, []);

  const value: GlobalContextValue = {
    state,
    dispatch,
    setAppMode,
    setUserRole,
    bookTicket,
    addHazardReport,
    verifyReport,
    escalateSeverity,
    addCivicPoints,
    setMapTarget,
    setActiveTicketModal,
    setDriverAlert,
    setDedupBanner,
    addToast,
    removeToast,
    updateFerries,
    triggerDuplicatePotholeDemo,
    triggerMTCDriverDetourDemo,
    triggerWaterLinkTicketDemo,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobal(): GlobalContextValue {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
}
