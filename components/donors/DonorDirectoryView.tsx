'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Mic,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  Check,
  MapPin,
  Clock,
  Phone,
  Heart,
  ShieldCheck,
  Send,
  Droplet,
  UserCheck,
  X,
  RotateCcw,
  Navigation,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Building2,
  Sparkles,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { BloodGroup, Donor } from '@/lib/types';
import { toBengaliDigits } from '@/lib/bengali-utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  fetchDonorsDirectory,
  fetchDonorBookmarks,
  toggleDonorBookmark,
  normalizeDistrict,
} from '@/lib/services/bloodService';
import { allDistricts, findNearestDistrict } from '@/lib/geo/bangladeshGeoData';
import { DistrictSelectorModal } from '@/components/location/DistrictSelectorModal';
import { AuthorizedContactModal } from '@/components/donors/AuthorizedContactModal';

interface DonorDirectoryViewProps {
  donors?: Donor[];
  currentDistrict?: string;
  onDistrictChange?: (district: string) => void;
  onRequestBloodClick: () => void;
  onSendDirectRequest: (donor: Donor) => void;
  onOpenAuth?: () => void;
  currentUserId?: string;
}

export const DonorDirectoryView: React.FC<DonorDirectoryViewProps> = ({
  donors: initialDonorsProp,
  currentDistrict: initialDistrictProp = 'বগুড়া সদর',
  onDistrictChange,
  onRequestBloodClick,
  onSendDirectRequest,
  onOpenAuth,
  currentUserId,
}) => {
  const { language, t, formatDigits } = useLanguage();

  // Helper to read initial state from URL or sessionStorage for persistence across page refresh
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      return {
        searchQuery: '',
        selectedGroup: 'all' as BloodGroup | 'all',
        selectedDistrict: initialDistrictProp || 'বগুড়া সদর',
        availableOnly: false,
        verifiedOnly: false,
        maxDistance: 50,
        sortBy: 'distance' as 'distance' | 'donations' | 'fastest' | 'recent',
        activeTab: 'all' as 'all' | 'saved',
        viewMode: 'list' as 'list' | 'map',
        currentPage: 1,
      };
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const savedStorage = sessionStorage.getItem('roktodata_donor_filters');
      const parsedStorage = savedStorage ? JSON.parse(savedStorage) : {};

      const searchQuery = params.get('q') || parsedStorage.searchQuery || '';
      const selectedGroup = (params.get('group') as BloodGroup | 'all') || parsedStorage.selectedGroup || 'all';
      const selectedDistrict = params.get('district') || parsedStorage.selectedDistrict || initialDistrictProp || 'বগুড়া সদর';
      const availableOnly = params.get('available') === 'true' || parsedStorage.availableOnly || false;
      const verifiedOnly = params.get('verified') === 'true' || parsedStorage.verifiedOnly || false;
      const maxDistance = params.get('dist') ? Number(params.get('dist')) : (parsedStorage.maxDistance || 50);
      const sortBy = (params.get('sort') as any) || parsedStorage.sortBy || 'distance';
      const activeTab = (params.get('tab') as any) || parsedStorage.activeTab || 'all';
      const viewMode = (params.get('view') as any) || parsedStorage.viewMode || 'list';
      const currentPage = params.get('page') ? Number(params.get('page')) : (parsedStorage.currentPage || 1);

      return {
        searchQuery,
        selectedGroup,
        selectedDistrict,
        availableOnly,
        verifiedOnly,
        maxDistance,
        sortBy,
        activeTab,
        viewMode,
        currentPage,
      };
    } catch {
      return {
        searchQuery: '',
        selectedGroup: 'all' as BloodGroup | 'all',
        selectedDistrict: initialDistrictProp || 'বগুড়া সদর',
        availableOnly: false,
        verifiedOnly: false,
        maxDistance: 50,
        sortBy: 'distance' as 'distance' | 'donations' | 'fastest' | 'recent',
        activeTab: 'all' as 'all' | 'saved',
        viewMode: 'list' as 'list' | 'map',
        currentPage: 1,
      };
    }
  };

  const initialValues = useMemo(() => getInitialState(), []);

  // Filter & Search State
  const [viewMode, setViewMode] = useState<'list' | 'map'>(initialValues.viewMode);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>(initialValues.activeTab);
  const [searchQuery, setSearchQuery] = useState(initialValues.searchQuery);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'all'>(initialValues.selectedGroup);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialValues.selectedDistrict);
  const [availableOnly, setAvailableOnly] = useState<boolean>(Boolean(initialValues.availableOnly));
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(Boolean(initialValues.verifiedOnly));
  const [maxDistance, setMaxDistance] = useState<number>(initialValues.maxDistance);
  const [sortBy, setSortBy] = useState<'distance' | 'donations' | 'fastest' | 'recent'>(initialValues.sortBy);
  const [currentPage, setCurrentPage] = useState<number>(initialValues.currentPage);
  const pageSize = 8;

  // UI Modals & Sheets
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [selectedContactDonor, setSelectedContactDonor] = useState<Donor | null>(null);
  const [selectedMapDonor, setSelectedMapDonor] = useState<Donor | null>(null);

  // GPS State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string>('');

  // Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Live Data & Pagination State
  const [donorsList, setDonorsList] = useState<Donor[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [groupStats, setGroupStats] = useState<Record<BloodGroup, { total: number; available: number }>>({
    'A+': { total: 0, available: 0 },
    'B+': { total: 0, available: 0 },
    'O+': { total: 0, available: 0 },
    'AB+': { total: 0, available: 0 },
    'A-': { total: 0, available: 0 },
    'B-': { total: 0, available: 0 },
    'O-': { total: 0, available: 0 },
    'AB-': { total: 0, available: 0 },
  });

  const [isStatsExpanded, setIsStatsExpanded] = useState<boolean>(false);

  // Synchronize with external district changes (e.g. Header dropdown selection)
  useEffect(() => {
    if (initialDistrictProp && initialDistrictProp !== selectedDistrict) {
      setSelectedDistrict(initialDistrictProp);
      setCurrentPage(1);
    }
  }, [initialDistrictProp]);

  // Load Bookmarks on Mount
  useEffect(() => {
    let isMounted = true;
    fetchDonorBookmarks(currentUserId).then((ids: string[]) => {
      if (isMounted) setBookmarkedIds(ids);
    });
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Persist State to URL and sessionStorage so Page Refresh preserves exact state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stateToSave = {
      searchQuery,
      selectedGroup,
      selectedDistrict,
      availableOnly,
      verifiedOnly,
      maxDistance,
      sortBy,
      activeTab,
      viewMode,
      currentPage,
    };

    try {
      sessionStorage.setItem('roktodata_donor_filters', JSON.stringify(stateToSave));

      const params = new URLSearchParams(window.location.search);
      if (searchQuery) params.set('q', searchQuery);
      else params.delete('q');

      if (selectedGroup !== 'all') params.set('group', selectedGroup);
      else params.delete('group');

      if (selectedDistrict && selectedDistrict !== 'all') params.set('district', selectedDistrict);
      else params.delete('district');

      if (availableOnly) params.set('available', 'true');
      else params.delete('available');

      if (verifiedOnly) params.set('verified', 'true');
      else params.delete('verified');

      if (maxDistance && maxDistance < 100) params.set('dist', String(maxDistance));
      else params.delete('dist');

      if (sortBy !== 'distance') params.set('sort', sortBy);
      else params.delete('sort');

      if (activeTab !== 'all') params.set('tab', activeTab);
      else params.delete('tab');

      if (viewMode !== 'list') params.set('view', viewMode);
      else params.delete('view');

      if (currentPage > 1) params.set('page', String(currentPage));
      else params.delete('page');

      const newQuery = params.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
      window.history.replaceState({ ...window.history.state }, '', newUrl);
    } catch (e) {
      // Ignore browser history error
    }
  }, [
    searchQuery,
    selectedGroup,
    selectedDistrict,
    availableOnly,
    verifiedOnly,
    maxDistance,
    sortBy,
    activeTab,
    viewMode,
    currentPage,
  ]);

  // Fetch Donors from Database Service
  const loadDonors = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchDonorsDirectory({
        district: selectedDistrict === 'all' ? 'all' : selectedDistrict,
        bloodGroup: selectedGroup,
        searchQuery,
        availableOnly,
        verifiedOnly,
        maxDistanceKm: maxDistance < 100 ? maxDistance : undefined,
        userCoords,
        sortBy,
        bookmarkedOnly: activeTab === 'saved',
        bookmarkedIds,
        page: currentPage,
        pageSize,
      });

      setDonorsList(result.donors);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);

      // Also compute blood group distribution across full available pool
      const fullPoolResult = await fetchDonorsDirectory({
        district: selectedDistrict === 'all' ? 'all' : selectedDistrict,
        bloodGroup: 'all',
        pageSize: 100,
        userCoords,
      });

      const stats: Record<BloodGroup, { total: number; available: number }> = {
        'A+': { total: 0, available: 0 },
        'B+': { total: 0, available: 0 },
        'O+': { total: 0, available: 0 },
        'AB+': { total: 0, available: 0 },
        'A-': { total: 0, available: 0 },
        'B-': { total: 0, available: 0 },
        'O-': { total: 0, available: 0 },
        'AB-': { total: 0, available: 0 },
      };

      for (const d of fullPoolResult.donors) {
        const bg = d.bloodGroup as BloodGroup;
        if (bg && bg in stats) {
          stats[bg].total += 1;
          if (d.isAvailableToday) stats[bg].available += 1;
        }
      }
      setGroupStats(stats);
    } catch (err) {
      console.error('Error fetching donors directory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedDistrict,
    selectedGroup,
    searchQuery,
    availableOnly,
    verifiedOnly,
    maxDistance,
    userCoords,
    sortBy,
    activeTab,
    bookmarkedIds,
    currentPage,
  ]);

  // Trigger load when relevant dependencies change
  useEffect(() => {
    loadDonors();
  }, [loadDonors]);

  // Toggle Bookmark Handler
  const handleToggleBookmark = async (id: string) => {
    const { allBookmarked } = await toggleDonorBookmark(id, currentUserId);
    setBookmarkedIds(allBookmarked);
  };

  // Handle GPS Auto Detect
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setGpsMessage(
        language === 'bn'
          ? 'আপনার ব্রাউজারে জিপিএস অবস্থান সমর্থিত নয়। জেলা ভিত্তিক তালিকা প্রদর্শন করা হচ্ছে।'
          : 'Geolocation not supported in browser. District fallback active.'
      );
      return;
    }

    setIsGpsLoading(true);
    setGpsMessage(language === 'bn' ? 'জিপিএস অবস্থান শনাক্ত করা হচ্ছে...' : 'Detecting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setSortBy('distance');
        setIsGpsLoading(false);

        // Find nearest district to notify user
        const nearest = findNearestDistrict(coords.lat, coords.lng);
        if (nearest && nearest.district) {
          setGpsMessage(
            language === 'bn'
              ? `জিপিএস সক্রিয়: নিকটতম জেলা ${nearest.district.nameBn} (${formatDigits(nearest.distanceKm)} কিমি)। নিকটতম ডোনাররা প্রথমে প্রদর্শিত হচ্ছে।`
              : `GPS Active: Nearest district is ${nearest.district.nameEn} (${nearest.distanceKm} km). Closest donors sorted first.`
          );
        }
      },
      (err) => {
        setIsGpsLoading(false);
        setUserCoords(null);
        setGpsMessage(
          language === 'bn'
            ? 'লোকেশন অনুমতি মেলেনি। জেলা বা উপজেলা ভিত্তিক বিকল্প সার্চ সক্রিয় রয়েছে।'
            : 'Location permission denied. District & Upazila alternative search remains active.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGroup('all');
    setSelectedDistrict(initialDistrictProp || 'বগুড়া সদর');
    setAvailableOnly(false);
    setVerifiedOnly(false);
    setMaxDistance(50);
    setSortBy('distance');
    setCurrentPage(1);
    setActiveTab('all');
  };

  // Handle District Change
  const handleSelectDistrict = (dist: string) => {
    setSelectedDistrict(dist);
    setCurrentPage(1);
    if (onDistrictChange) onDistrictChange(dist);
  };

  const totalAvailableReadyCount = Object.values(groupStats).reduce((acc, g) => acc + g.available, 0);
  const totalRestingCount = Object.values(groupStats).reduce((acc, g) => acc + (g.total - g.available), 0);

  return (
    <div className="flex flex-col w-full pb-36 md:pb-32">
      {/* ================= TOP STICKY SEARCH & NAVIGATION BAR ================= */}
      <div className="px-4 max-[360px]:px-3 pt-2.5 pb-2 flex flex-col gap-2 bg-white md:backdrop-blur-md border-b border-[#E4E6EB] sticky top-14 md:top-16 z-20 md:shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        
        {/* Row 1: Search Bar with Integrated Clear, Voice & Filter CTA */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4.5 h-4.5 text-[#5B5F6B] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t.donors.searchPlaceholder}
              className="w-full h-12 pl-10 pr-18 bg-[#F7F7F9] text-[#1B1B1F] placeholder:text-[#8E929E] rounded-2xl text-[16px] md:text-sm focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#C41E3A]/25 focus:border-[#C41E3A] transition-all border border-[#E4E6EB]/80"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-[#5B5F6B] hover:text-[#1B1B1F] rounded-full hover:bg-[#E4E6EB] transition-all cursor-pointer"
                  title={language === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  const speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!speech) {
                    alert(
                      language === 'bn'
                        ? 'আপনার ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়।'
                        : 'Voice search is not supported in this browser.'
                    );
                    return;
                  }
                  const recognition = new speech();
                  recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
                  recognition.onresult = (event: any) => {
                    const text = event.results[0][0].transcript;
                    setSearchQuery(text);
                    setCurrentPage(1);
                  };
                  recognition.start();
                }}
                aria-label={language === 'bn' ? 'ভয়েস সার্চ' : 'Voice Search'}
                className="w-8 h-8 flex items-center justify-center text-[#5B5F6B] hover:text-[#C41E3A] rounded-full hover:bg-[#FDECEF] active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Filter Modal Trigger Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            aria-label={t.donors.filterBtn}
            className={`h-12 min-w-[48px] px-3.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold border transition-all cursor-pointer active:scale-95 shrink-0 ${
              (availableOnly || verifiedOnly || selectedGroup !== 'all' || maxDistance < 50 || sortBy !== 'distance')
                ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A] ring-1 ring-[#C41E3A]/40'
                : 'bg-[#F7F7F9] hover:bg-[#F0EDF2] border-[#E4E6EB] text-[#1B1B1F]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C41E3A]" />
            <span className="hidden xs:inline">{t.donors.filterBtn}</span>
            {(availableOnly || verifiedOnly || selectedGroup !== 'all' || maxDistance < 50 || sortBy !== 'distance') && (
              <span className="w-2 h-2 rounded-full bg-[#C41E3A] animate-pulse" />
            )}
          </button>
        </div>

        {/* Row 2: Clean Utility Controls Bar (List/Map, District, Saved, GPS, Sort) */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* List vs Map Switcher */}
          <div className="flex items-center p-0.5 bg-[#F0EDF2] rounded-full h-8 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#C41E3A] shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.donors.tabList}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-[#C41E3A] shadow-xs'
                  : 'text-[#5B5F6B] hover:text-[#1B1B1F]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t.donors.tabMap}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* District Location Selector Pill */}
            <button
              onClick={() => setIsDistrictModalOpen(true)}
              className="h-8 px-2.5 bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] rounded-full flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-[#E4E6EB]/80 max-w-[130px] sm:max-w-[180px] shrink-0"
              title={language === 'bn' ? 'জেলা পরিবর্তন করুন' : 'Change District'}
            >
              <MapPin className="w-3 h-3 text-[#C41E3A] shrink-0" />
              <span className="text-xs font-bold truncate">
                {selectedDistrict === 'all'
                  ? language === 'bn'
                    ? 'সারা দেশ'
                    : 'All'
                  : selectedDistrict}
              </span>
            </button>

            {/* Bookmarked / Saved Pill */}
            <button
              onClick={() => {
                setActiveTab(activeTab === 'all' ? 'saved' : 'all');
                setCurrentPage(1);
              }}
              className={`h-8 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border shrink-0 ${
                activeTab === 'saved'
                  ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                  : 'bg-[#F7F7F9] border-[#E4E6EB]/80 text-[#5B5F6B] hover:bg-[#F0EDF2]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === 'saved' ? 'fill-current text-[#C41E3A]' : ''}`} />
              <span className="hidden sm:inline">{t.donors.tabMyDonors}</span>
              {bookmarkedIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#C41E3A] text-white text-[10px] font-black">
                  {formatDigits(bookmarkedIds.length)}
                </span>
              )}
            </button>

            {/* GPS Quick Action Pill */}
            <button
              onClick={handleGpsDetect}
              disabled={isGpsLoading}
              className={`h-8 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border active:scale-95 shrink-0 ${
                userCoords
                  ? 'bg-[#E8F5E9] text-[#005938] border-[#A5D6A7]'
                  : 'bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#1B1B1F] border-[#E4E6EB]/80'
              }`}
            >
              {isGpsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C41E3A]" />
              ) : (
                <Navigation className={`w-3.5 h-3.5 ${userCoords ? 'text-[#00744B] fill-current' : 'text-[#C41E3A]'}`} />
              )}
              <span>{userCoords ? (language === 'bn' ? 'জিপিএস সক্রিয়' : 'GPS Active') : (language === 'bn' ? 'জিপিএস' : 'GPS')}</span>
            </button>

            {/* Sort Selector */}
            <div className="flex items-center shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="h-8 bg-[#F7F7F9] text-xs font-bold text-[#1B1B1F] rounded-full px-2 border border-[#E4E6EB]/80 outline-hidden cursor-pointer"
              >
                <option value="distance">{language === 'bn' ? 'নিকটতম' : 'Nearest'}</option>
                <option value="donations">{language === 'bn' ? 'সর্বাধিক দান' : 'Most'}</option>
                <option value="fastest">{language === 'bn' ? 'দ্রুত সাড়া' : 'Fast'}</option>
                <option value="recent">{language === 'bn' ? 'নতুন' : 'Newest'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* GPS Alert feedback if message set */}
        {gpsMessage && (
          <div className="p-2 rounded-xl bg-[#FAF9FB] border border-[#E4E6EB] flex items-center justify-between text-xs text-[#5B5F6B] animate-in fade-in">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] shrink-0" />
              <span className="truncate">{gpsMessage}</span>
            </div>
            <button
              onClick={() => setGpsMessage('')}
              className="w-5 h-5 rounded-full hover:bg-[#E4E6EB] flex items-center justify-center text-gray-400 hover:text-black cursor-pointer shrink-0 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ================= QUICK HORIZONTAL FILTER CHIPS ================= */}
      <div className="w-full overflow-x-auto py-2 px-4 max-[360px]:px-3 bg-white border-b border-[#E4E6EB] flex items-center gap-1.5 no-scrollbar">
        {/* All Blood Groups Chip */}
        <button
          onClick={() => {
            setSelectedGroup('all');
            setCurrentPage(1);
          }}
          className={`shrink-0 h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
            selectedGroup === 'all'
              ? 'bg-[#C41E3A] text-white shadow-xs'
              : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2] border border-[#E4E6EB]/60'
          }`}
        >
          <span>{language === 'bn' ? 'সব গ্রুপ' : 'All Groups'}</span>
        </button>

        {/* Individual Blood Group Chips */}
        {(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'] as BloodGroup[]).map((grp) => {
          const isSelected = selectedGroup === grp;
          return (
            <button
              key={grp}
              onClick={() => {
                setSelectedGroup(isSelected ? 'all' : grp);
                setCurrentPage(1);
              }}
              className={`shrink-0 h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-[#FDECEF] text-[#C41E3A] ring-1.5 ring-[#C41E3A] shadow-xs'
                  : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#F0EDF2] border border-[#E4E6EB]/60'
              }`}
            >
              <span>{grp}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-[#C41E3A]" />}
            </button>
          );
        })}

        {/* Quick Available Today Chip */}
        <button
          onClick={() => {
            setAvailableOnly((prev) => !prev);
            setCurrentPage(1);
          }}
          className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
            availableOnly
              ? 'bg-[#E8F5E9] text-[#005938] ring-1.5 ring-[#00744B]'
              : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2] border border-[#E4E6EB]/60'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00744B] animate-pulse" />
          <span>{t.donors.availableTodayOnly}</span>
        </button>

        {/* Quick Verified Donors Chip */}
        <button
          onClick={() => {
            setVerifiedOnly((prev) => !prev);
            setCurrentPage(1);
          }}
          className={`shrink-0 h-8 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
            verifiedOnly
              ? 'bg-[#D9E2FF] text-[#001946] ring-1.5 ring-[#0D58C9]'
              : 'bg-[#F7F7F9] text-[#5B5F6B] hover:bg-[#F0EDF2] border border-[#E4E6EB]/60'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-[#0D58C9]" />
          <span>{t.donors.verifiedOnly}</span>
        </button>
      </div>

      {/* ================= INTERACTIVE DONOR ANALYTICS ACCORDION ================= */}
      <div className="mx-0 md:mx-4 my-2 p-4 max-[360px]:p-3 bg-white md:rounded-2xl border-y md:border border-[#E4E6EB] md:shadow-2xs transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FDECEF] text-[#C41E3A] flex items-center justify-center font-bold shrink-0">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold text-[#1B1B1F] truncate leading-tight">
                {t.donors.chartTitle}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold mt-0.5">
                <span className="text-[#0B7A50] bg-[#E8F5E9] px-1.5 py-0.2 rounded-md">
                  {formatDigits(totalAvailableReadyCount)} {t.donors.readyLabel}
                </span>
                <span className="text-[#5B5F6B] bg-[#F0EDF2] px-1.5 py-0.2 rounded-md">
                  {formatDigits(totalRestingCount)} {t.donors.restingLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsStatsExpanded((prev) => !prev)}
            className="px-2.5 py-1 rounded-full bg-[#F7F7F9] hover:bg-[#F0EDF2] text-[#C41E3A] text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer border border-[#E4E6EB]/70"
          >
            <span>{isStatsExpanded ? t.donors.chartToggleHide : t.donors.chartToggleShow}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Chart Grid */}
        {isStatsExpanded && (
          <div className="pt-3 mt-2 border-t border-[#F0EDF2] animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] text-[#5B5F6B] mb-2">{t.donors.chartSub}</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'] as BloodGroup[]).map((grp) => {
                const count = groupStats[grp]?.total || 0;
                const availableCount = groupStats[grp]?.available || 0;
                const isSelected = selectedGroup === grp;
                const heightPercent = Math.min(100, Math.max(25, count * 16));

                return (
                  <button
                    key={grp}
                    onClick={() => {
                      setSelectedGroup(selectedGroup === grp ? 'all' : grp);
                      setCurrentPage(1);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDECEF] border-[#C41E3A] ring-1 ring-[#C41E3A] shadow-xs scale-102'
                        : 'bg-[#FAF9FB] border-[#E4E6EB]/70 hover:bg-white'
                    }`}
                  >
                    <div className="w-full flex flex-col items-center justify-end h-12 pb-1">
                      <span className="text-[10px] font-black text-[#1B1B1F] mb-0.5">
                        {formatDigits(count)}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[18px] rounded-t-md transition-all ${
                          isSelected
                            ? 'bg-[#C41E3A]'
                            : count > 0
                            ? 'bg-gradient-to-t from-[#5B5F6B] to-[#8C8F9A]'
                            : 'bg-[#E4E6EB]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-extrabold text-[#1B1B1F] mt-1">{grp}</span>
                    <span className="text-[9px] text-[#0B7A50] font-semibold">
                      {formatDigits(availableCount)} {language === 'bn' ? 'সক্রিয়' : 'active'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= RESULTS SUMMARY & BREADCRUMB BAR ================= */}
      <div className="px-4 max-[360px]:px-3 py-2.5 flex items-center justify-between text-xs text-[#5B5F6B]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A]" />
          <span>
            {language === 'bn' ? (
              <>
                <strong>
                  {selectedDistrict === 'all'
                    ? 'সারা বাংলাদেশে'
                    : `${normalizeDistrict(selectedDistrict)} অঞ্চলে`}
                </strong>{' '}
                মোট <strong className="text-[#1B1B1F] font-bold">{formatDigits(totalCount)} জন</strong> রক্তদাতা
                {selectedGroup !== 'all' ? ` (${selectedGroup} গ্রুপ)` : ''}
              </>
            ) : (
              <>
                Found <strong className="text-[#1B1B1F] font-bold">{totalCount} donors</strong> in{' '}
                {selectedDistrict === 'all' ? 'all Bangladesh' : selectedDistrict}
              </>
            )}
          </span>
        </div>

        {/* Clear Group Filter Action if Active */}
        {selectedGroup !== 'all' && (
          <button
            onClick={() => {
              setSelectedGroup('all');
              setCurrentPage(1);
            }}
            className="text-[11px] text-[#C41E3A] font-bold hover:underline cursor-pointer"
          >
            {t.donors.viewAllGroups}
          </button>
        )}
      </div>

      {/* ================= LOADING SPINNER STATE ================= */}
      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#C41E3A] animate-spin" />
          <p className="text-xs text-[#5B5F6B] font-semibold">
            {language === 'bn'
              ? 'সুপারবেস ডেটাবেস থেকে রক্তদাতাদের তালিকা লোড হচ্ছে...'
              : 'Loading blood donors from cloud database...'}
          </p>
        </div>
      ) : donorsList.length === 0 ? (
        /* ================= EMPTY SEARCH RESULT STATE ================= */
        <div className="p-8 text-center space-y-3.5 bg-white rounded-3xl m-4 border border-[#E4E6EB] shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FDECEF] flex items-center justify-center text-[#C41E3A] mx-auto shadow-2xs">
            <Droplet className="w-8 h-8 text-[#C41E3A]" />
          </div>
          <h4 className="font-extrabold text-sm sm:text-base text-[#1B1B1F]">
            {t.donors.noDonorsFound}
          </h4>
          <p className="text-xs text-[#5B5F6B] max-w-sm mx-auto leading-relaxed">
            {language === 'bn'
              ? 'আপনার নির্বাচিত ফিল্টারে কোনো রক্তদাতা মেলেনি। দূরত্ব সীমা বাড়িয়ে দেখুন বা সারা দেশব্যাপী খুঁজুন।'
              : 'No donors matched your filters. Try expanding distance radius or search countrywide.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 max-w-xs mx-auto">
            <button
              onClick={() => {
                setMaxDistance(100);
                setSelectedGroup('all');
                setSelectedDistrict('all');
                setAvailableOnly(false);
                setVerifiedOnly(false);
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="flex-1 h-11 rounded-xl bg-[#F0EDF2] text-[#1B1B1F] text-xs font-bold cursor-pointer hover:bg-[#E4E6EB] transition-colors"
            >
              {language === 'bn' ? 'সারা দেশে খুঁজুন' : 'Search Countrywide'}
            </button>
            <button
              onClick={onRequestBloodClick}
              className="flex-1 h-11 rounded-xl bg-[#C41E3A] text-white text-xs font-bold cursor-pointer hover:bg-[#A3182F] shadow-xs transition-colors"
            >
              {language === 'bn' ? 'রক্তের অনুরোধ পোস্ট করুন' : 'Create Request'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ================= VIEW MODE: MAP VIEW SIMULATION ================= */}
          {viewMode === 'map' && (
            <div className="px-3 sm:px-4 py-2">
              <div className="w-full h-80 rounded-2xl bg-[#E2E6EE] relative overflow-hidden shadow-xs border border-[#E4E6EB]">
                {/* Visual Map Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,60 Q120,40 240,110 T400,160" stroke="#FFFFFF" strokeWidth="8" fill="none" />
                  <path d="M50,0 Q80,150 140,240 T220,340" stroke="#FFFFFF" strokeWidth="12" fill="none" />
                  <path d="M180,0 Q190,120 300,200 T400,280" stroke="#60A5FA" strokeWidth="10" fill="none" />
                  <circle cx="150" cy="140" r="45" fill="#FFFFFF" opacity="0.6" />
                </svg>

                {/* Center Landmark */}
                <div className="absolute top-12 left-10 flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-[#C41E3A] text-white text-[10px] font-bold shadow-xs">
                    {selectedDistrict === 'all' ? 'বাংলাদেশ কেন্দ্রীয় ভিউ' : selectedDistrict}
                  </div>
                  <div className="w-2 h-2 bg-[#C41E3A] rotate-45 -mt-1" />
                </div>

                {/* Donor Pins */}
                {donorsList.slice(0, 10).map((donor, idx) => {
                  const positions = [
                    { top: '35%', left: '42%' },
                    { top: '55%', left: '28%' },
                    { top: '25%', left: '68%' },
                    { top: '65%', left: '60%' },
                    { top: '75%', left: '38%' },
                    { top: '40%', left: '75%' },
                    { top: '48%', left: '50%' },
                    { top: '30%', left: '30%' },
                  ];
                  const pos = positions[idx % positions.length];
                  const isSelected = selectedMapDonor?.id === donor.id;

                  return (
                    <button
                      key={donor.id}
                      onClick={() => setSelectedMapDonor(donor)}
                      style={{ top: pos.top, left: pos.left }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95 cursor-pointer ${
                        isSelected ? 'scale-125 z-30' : 'z-10'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-8 px-2 rounded-full flex items-center gap-1 font-black text-xs shadow-md border-2 ${
                            isSelected
                              ? 'bg-[#C41E3A] text-white border-white'
                              : 'bg-white text-[#C41E3A] border-[#C41E3A]'
                          }`}
                        >
                          <Droplet className="w-3 h-3 fill-current" />
                          <span>{donor.bloodGroup}</span>
                        </div>
                        <div className="w-2 h-2 bg-current rotate-45 -mt-1" />
                      </div>
                    </button>
                  );
                })}

                {/* Floating Selected Map Donor Card */}
                {selectedMapDonor && (
                  <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#E4E6EB] animate-in slide-in-from-bottom duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#FDECEF] text-[#C41E3A] font-black text-base flex items-center justify-center shrink-0">
                          {selectedMapDonor.bloodGroup}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#1B1B1F] truncate">
                            {selectedMapDonor.name}
                          </h4>
                          <p className="text-xs text-[#5B5F6B] truncate">
                            {selectedMapDonor.location} • {formatDigits(selectedMapDonor.distanceKm)} {language === 'bn' ? 'কিমি দূরে' : 'km away'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedContactDonor(selectedMapDonor)}
                          className="h-9 px-3 bg-[#00744B] text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          {language === 'bn' ? 'যোগাযোগ' : 'Contact'}
                        </button>
                        <button
                          onClick={() => onSendDirectRequest(selectedMapDonor)}
                          className="h-9 px-3 bg-[#C41E3A] text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          {language === 'bn' ? 'অনুরোধ' : 'Request'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= VIEW MODE: LIST FEED ================= */}
          {viewMode === 'list' && (
            <div className="px-0 md:px-4 grid grid-cols-1 md:grid-cols-2 md:gap-3.5 divide-y divide-[#E4E6EB] md:divide-y-0">
              {donorsList.map((donor, idx) => (
                <React.Fragment key={donor.id}>
                  {/* Safe Harbor Privacy card after 2nd donor */}
                  {idx === 2 && (
                    <div className="md:col-span-2 p-4 max-[360px]:px-3 md:rounded-2xl bg-[#D9E2FF]/20 border-b md:border border-[#D9E2FF] text-[#1B1B1F] flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#0D58C9] shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-[#0D58C9]">
                          {language === 'bn' ? 'নিরাপদ ও নির্ভরযোগ্য যোগাযোগ ব্যবস্থা' : 'Protected Contact System'}
                        </span>
                        <p className="text-[#5B5F6B] leading-relaxed">
                          {language === 'bn'
                            ? 'ডোনারদের ব্যক্তিগত নিরাপত্তা ও সুরক্ষা নিশ্চিতে সাধারণ ডিরেক্টরিতে ফোন নম্বর সুরক্ষিত রাখা হয়েছে। জরুরি মানবিক রক্তদানের প্রয়োজনে সম্মতি নিশ্চিত করে সরাসরি যোগাযোগ করা যাবে।'
                            : 'Phone numbers are securely masked to prevent harassment. Direct contact is authorized upon medical necessity consent.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Donor Card */}
                  <div className="bg-white md:rounded-3xl p-4 max-[360px]:px-3 sm:p-5 md:shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-b md:border border-[#E4E6EB] flex flex-col justify-between gap-3.5 transition-all md:hover:shadow-md md:hover:border-[#D5D8E0]">
                    {/* Top Row: Avatar, Name, Location & Blood Group Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FDECEF] to-[#FFF0F2] flex items-center justify-center text-[#9E0027] text-xl font-black shadow-2xs border border-[#FFCDD2]/60">
                            {donor.avatarText || donor.name.charAt(0)}
                          </div>
                          {donor.isAvailableToday && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00744B] ring-2 ring-white shadow-xs"
                              title={t.donors.availableTodayOnly}
                            />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h2 className="font-extrabold text-[15px] sm:text-base text-[#1B1B1F] truncate leading-tight">
                              {donor.name}
                            </h2>
                            {donor.isVerified && (
                              <span
                                className="w-4.5 h-4.5 rounded-full bg-[#0D58C9] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs"
                                title={t.donors.verifiedBadge}
                              >
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs text-[#5B5F6B] mt-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-[#5B5F6B] shrink-0" />
                            <span className="truncate">
                              {language === 'bn' ? 'প্রায়' : 'Approx.'} {formatDigits(donor.distanceKm)}{' '}
                              {language === 'bn' ? 'কিমি' : 'km'} • {donor.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Blood Group Badge */}
                      <div className="shrink-0 w-13.5 h-13.5 rounded-2xl bg-gradient-to-br from-[#9E0027] to-[#C41E3A] text-white flex flex-col items-center justify-center shadow-xs border-2 border-white">
                        <span className="text-[21px] font-black leading-none drop-shadow-2xs">
                          {donor.bloodGroup}
                        </span>
                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-white/90 mt-0.5">
                          {t.donors.bloodGroupBadge}
                        </span>
                      </div>
                    </div>

                    {/* Status & Credibility Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {donor.isAvailableToday ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#005938] text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00744B] animate-pulse" />
                          <span>{t.donors.availableTodayOnly}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0EDF2] text-[#5B5F6B] text-xs font-medium">
                          <span>{t.donors.restingBadge}</span>
                        </div>
                      )}

                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F7F9] text-[#5B5F6B] text-xs font-medium border border-[#E4E6EB]/50">
                        <Clock className="w-3 h-3 text-[#5B5F6B]" />
                        <span>
                          {language === 'bn' ? 'শেষ রক্তদান:' : 'Last donation:'} {donor.lastDonationDate}
                        </span>
                      </div>

                      {donor.totalDonations > 0 && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDECEF]/60 text-[#C41E3A] text-xs font-bold border border-[#FFCDD2]/50">
                          <Droplet className="w-3 h-3 text-[#C41E3A] fill-current" />
                          <span>
                            {language === 'bn'
                              ? `${formatDigits(donor.totalDonations)} বার রক্তদান`
                              : `${donor.totalDonations} ${donor.totalDonations === 1 ? 'donation' : 'donations'}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Phone Privacy Status Row */}
                    <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-[#F7F7F9] text-xs border border-[#E4E6EB]/60">
                      <div className="flex items-center gap-2 text-[#5B5F6B]">
                        <Shield className="w-3.5 h-3.5 text-[#00744B] shrink-0" />
                        <span className="font-mono font-bold text-[#1B1B1F] tracking-wide">
                          {donor.phoneMasked || '০১৭১২-***৬৭৮'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#E8F5E9] text-[#005938] font-black">
                          {donor.privacyHidePhone
                            ? t.donors.privatePhone
                            : t.donors.protectedPhone}
                        </span>
                      </div>

                      {donor.responseTimeMinutes && (
                        <span className="text-[11px] text-[#5B5F6B] font-semibold truncate ml-1">
                          ⚡ {donor.responseTimeMinutes}
                        </span>
                      )}
                    </div>

                    {/* Action Bottom Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#F0EDF2]">
                      {/* Send Direct Request Button */}
                      <button
                        onClick={() => onSendDirectRequest(donor)}
                        className="flex-1 h-12 bg-gradient-to-r from-[#9E0027] to-[#C41E3A] hover:from-[#80001F] hover:to-[#B01A33] active:from-[#70001B] active:to-[#9E0027] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{t.donors.btnRequestDirect}</span>
                      </button>

                      {/* Authorized Contact & Phone Modal Trigger */}
                      <button
                        onClick={() => setSelectedContactDonor(donor)}
                        aria-label={t.donors.contactAndCall}
                        className="w-12 h-12 rounded-2xl bg-[#E8F5E9] hover:bg-[#C8E6C9] active:bg-[#A5D6A7] text-[#005938] flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 border border-[#A5D6A7]/40"
                        title={t.donors.contactAndCall}
                      >
                        <Phone className="w-4.5 h-4.5" />
                      </button>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleToggleBookmark(donor.id)}
                        aria-label={t.donors.saveBookmark}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 border ${
                          bookmarkedIds.includes(donor.id)
                            ? 'bg-[#FDECEF] border-[#FFCDD2] text-[#C41E3A]'
                            : 'bg-[#F7F7F9] hover:bg-[#F0EDF2] border-[#E4E6EB] text-[#5B5F6B]'
                        }`}
                      >
                        <Heart
                          className={`w-4.5 h-4.5 ${
                            bookmarkedIds.includes(donor.id) ? 'fill-current text-[#C41E3A]' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ================= PAGINATION BAR ================= */}
          {totalPages > 1 && (
            <div className="px-4 py-3.5 flex items-center justify-between border-y md:border border-[#E4E6EB] bg-white md:rounded-2xl mx-0 md:mx-4 mt-3 md:shadow-2xs">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E4E6EB] hover:bg-[#F7F7F9] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'bn' ? 'আগের পৃষ্ঠা' : 'Previous'}</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  if (totalPages > 6 && Math.abs(pageNum - currentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="text-gray-400 text-xs px-0.5">...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C41E3A] text-white shadow-xs'
                          : 'bg-[#F7F7F9] text-[#1B1B1F] hover:bg-[#E4E6EB]'
                      }`}
                    >
                      {formatDigits(pageNum)}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#E4E6EB] hover:bg-[#F7F7F9] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>{language === 'bn' ? 'পরের পৃষ্ঠা' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ================= FILTER BOTTOM SHEET DRAWER ================= */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-safe shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
            {/* Sheet Handle */}
            <div className="w-10 h-1.5 bg-[#E4E6EB] rounded-full mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
              <h3 className="font-bold text-base text-[#1B1B1F]">
                {language === 'bn' ? 'ডোনার ফিল্টার ও অনুসন্ধান' : 'Donor Filter & Search'}
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#C41E3A] flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            </div>

            {/* Distance Slider (5-100 km) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1B1B1F]">
                  {language === 'bn' ? 'সর্বোচ্চ দূরত্ব সীমা' : 'Maximum Distance'}
                </span>
                <span className="font-extrabold text-[#C41E3A]">
                  {maxDistance >= 100
                    ? language === 'bn'
                      ? 'সারা দেশ'
                      : 'Countrywide'
                    : language === 'bn'
                    ? `সর্বোচ্চ ${formatDigits(maxDistance)} কিমি`
                    : `Max ${maxDistance} km`}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxDistance}
                onChange={(e) => {
                  setMaxDistance(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#C41E3A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#5B5F6B]">
                <span>{formatDigits(5)} {language === 'bn' ? 'কিমি' : 'km'}</span>
                <span>{formatDigits(25)} {language === 'bn' ? 'কিমি' : 'km'}</span>
                <span>{formatDigits(50)} {language === 'bn' ? 'কিমি' : 'km'}</span>
                <span>{language === 'bn' ? 'সারা দেশ' : 'All'}</span>
              </div>
            </div>

            {/* Sorting Options */}
            <div className="space-y-1.5 pt-2 border-t border-[#E4E6EB]/60">
              <span className="font-bold text-xs text-[#1B1B1F] block">
                {language === 'bn' ? 'ফলাফল সাজানোর ক্রম' : 'Sort Results By'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'distance', label: language === 'bn' ? 'নিকটতম দূরত্ব' : 'Closest Distance' },
                  { id: 'donations', label: language === 'bn' ? 'সর্বাধিক রক্তদান' : 'Most Donations' },
                  { id: 'fastest', label: language === 'bn' ? 'দ্রুত সাড়া প্রদান' : 'Fast Responder' },
                  { id: 'recent', label: language === 'bn' ? 'নতুন নিবন্ধিত' : 'Recently Joined' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id as any);
                      setCurrentPage(1);
                    }}
                    className={`p-2 rounded-xl text-left font-bold transition-all border cursor-pointer ${
                      sortBy === s.id
                        ? 'bg-[#FDECEF] border-[#C41E3A] text-[#C41E3A]'
                        : 'bg-[#F7F7F9] border-[#E4E6EB] text-[#5B5F6B] hover:bg-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#E4E6EB]/50 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9] cursor-pointer hover:bg-white transition-all border border-[#E4E6EB]/50">
                <span className="font-semibold text-[#1B1B1F]">
                  {language === 'bn' ? 'শুধু আজ উপলব্ধ ডোনার' : 'Available today only'}
                </span>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => {
                    setAvailableOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-[#C41E3A] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F7F9] cursor-pointer hover:bg-white transition-all border border-[#E4E6EB]/50">
                <span className="font-semibold text-[#1B1B1F]">
                  {language === 'bn' ? 'শুধু ভেরিফায়েড রক্তদাতা' : 'Verified donors only'}
                </span>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-[#C41E3A] cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full h-12 rounded-2xl bg-[#C41E3A] hover:bg-[#A3182F] text-white font-bold text-xs shadow-md cursor-pointer active:scale-98 transition-all"
            >
              {language === 'bn'
                ? `ফলাফল দেখুন (${formatDigits(totalCount)} জন ডোনার)`
                : `View Results (${totalCount} Donors)`}
            </button>
          </div>
        </div>
      )}

      {/* ================= DISTRICT SELECTOR MODAL ================= */}
      <DistrictSelectorModal
        isOpen={isDistrictModalOpen}
        onClose={() => setIsDistrictModalOpen(false)}
        currentDistrict={selectedDistrict}
        onSelectDistrict={handleSelectDistrict}
      />

      {/* ================= AUTHORIZED CONTACT & CONSENT MODAL ================= */}
      <AuthorizedContactModal
        donor={selectedContactDonor}
        isOpen={Boolean(selectedContactDonor)}
        onClose={() => setSelectedContactDonor(null)}
        onSendDirectRequest={onSendDirectRequest}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
